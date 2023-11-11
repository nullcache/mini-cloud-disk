package tool

import (
	"context"
	"crypto/tls"
	"errors"
	"math/rand"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/nullcache/mini-cloud-disk/internal/config"
	"gopkg.in/gomail.v2"
)

func SendMail(c config.Config, email string, text string) error {
	d := gomail.NewDialer(c.MailVerification.Host, c.MailVerification.Port, c.MailVerification.Username, c.MailVerification.Password)
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	m := gomail.NewMessage()
	m.SetHeader("From", c.MailVerification.Username)
	m.SetHeader("To", email)
	m.SetHeader("Subject", "验证码")
	m.SetBody("text/html", text)

	if err := d.DialAndSend(m); err != nil {
		return err
	}
	return nil
}

func GenRand(words string, length int) string {
	var code string
	s := rand.NewSource(time.Now().UnixNano())
	for i := 0; i < length; i++ {
		code += string(words[rand.New(s).Intn(len([]rune(words)))])
	}
	return code
}

type GenTokenRes struct {
	AccessToken  string
	AccessExpire int64
}

func GenJwtToken(secret string, iat, expire int64, payload string) (*GenTokenRes, error) {
	claims := make(jwt.MapClaims)
	claims["exp"] = iat + expire
	claims["iat"] = iat
	claims["payload"] = payload
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	if token, err := token.SignedString([]byte(secret)); err != nil {
		return nil, err
	} else {
		return &GenTokenRes{
			AccessToken:  token,
			AccessExpire: expire,
		}, nil
	}
}

func GetIdFromCtx(ctx context.Context) (int64, error) {
	idStr, ok := ctx.Value("payload").(string)
	if !ok {
		return 0, errors.New("token不合法")
	}

	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return 0, errors.New("token不合法")
	}

	return id, nil
}

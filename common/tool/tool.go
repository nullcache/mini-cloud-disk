package tool

import (
	"crypto/tls"
	"math/rand"
	"time"

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

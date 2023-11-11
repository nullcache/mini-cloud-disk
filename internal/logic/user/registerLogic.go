package user

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/nullcache/mini-cloud-disk/internal/model"
	"github.com/nullcache/mini-cloud-disk/internal/svc"
	"github.com/nullcache/mini-cloud-disk/internal/types"
	"golang.org/x/crypto/bcrypt"

	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/core/stores/sqlc"
)

type RegisterLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewRegisterLogic(ctx context.Context, svcCtx *svc.ServiceContext) *RegisterLogic {
	return &RegisterLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *RegisterLogic) Register(req *types.RegisterReq) error {
	if len(req.Password) > 50 {
		return errors.New("密码过长")
	}
	user, err := l.svcCtx.UserModel.FindOneByUsername(l.ctx, req.Username)
	if err != nil && err != sqlc.ErrNotFound {
		return err
	}
	if user != nil {
		return errors.New("用户名已存在")
	}
	user, err = l.svcCtx.UserModel.FindOneByEmail(l.ctx, req.Email)

	if err != nil && err != sqlc.ErrNotFound {
		return err
	}
	if user != nil {
		return errors.New("邮箱已被注册")
	}
	eMapArr, err := l.svcCtx.Redis.HmgetCtx(l.ctx, req.Email, "Code", "ExpireTime")
	if err != nil {
		return err
	}
	if len(eMapArr) != 2 {
		return fmt.Errorf("验证码验证错误")
	}
	expireTime, _ := strconv.ParseInt(eMapArr[1], 10, 64)
	code := eMapArr[0]
	if code != req.Code || expireTime < time.Now().Unix() {
		return errors.New("验证码错误")
	}

	hashPasswd, error := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if error != nil {
		return errors.New("注册错误")
	}
	fmt.Println(11, string(hashPasswd))

	_, err = l.svcCtx.UserModel.Insert(l.ctx, &model.User{
		Username: req.Username,
		Password: string(hashPasswd),
		Email:    req.Email,
		Id:       l.svcCtx.SnowFlakeNode.Generate().Int64(),
	})
	if err != nil {
		return err
	}
	return nil
}

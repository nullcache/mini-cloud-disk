package user

import (
	"context"
	"fmt"
	"time"

	"github.com/nullcache/mini-cloud-disk/common/tool"
	"github.com/nullcache/mini-cloud-disk/internal/svc"
	"github.com/nullcache/mini-cloud-disk/internal/types"
	"golang.org/x/crypto/bcrypt"

	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/core/stores/sqlc"
)

type LoginLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewLoginLogic(ctx context.Context, svcCtx *svc.ServiceContext) *LoginLogic {
	return &LoginLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *LoginLogic) Login(req *types.LoginReq) (resp *types.LoginResp, err error) {
	user, err := l.svcCtx.UserModel.FindOneByUsername(l.ctx, req.Username)

	if err != nil && err != sqlc.ErrNotFound {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("密码错误")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, fmt.Errorf("密码错误")
	}

	token, err := tool.GenJwtToken(l.svcCtx.Config.JwtAuth.AccessSecret, time.Now().Unix(), l.svcCtx.Config.JwtAuth.AccessExpire, fmt.Sprint(user.Id))
	if err != nil {
		return nil, err
	}
	refreshToken, err := tool.GenJwtToken(l.svcCtx.Config.JwtAuth.AccessSecret, time.Now().Unix(), l.svcCtx.Config.JwtAuth.RefreshExpire, fmt.Sprint(user.Id))
	if err != nil {
		return nil, err
	}

	return &types.LoginResp{
		AccessToken:   token.AccessToken,
		AccessExpire:  token.AccessExpire,
		RefreshToken:  refreshToken.AccessToken,
		RefreshExpire: refreshToken.AccessExpire,
	}, nil

}

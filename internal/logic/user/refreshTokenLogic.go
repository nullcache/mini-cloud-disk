package user

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/nullcache/mini-cloud-disk/common/tool"
	"github.com/nullcache/mini-cloud-disk/internal/svc"
	"github.com/nullcache/mini-cloud-disk/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type RefreshTokenLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewRefreshTokenLogic(ctx context.Context, svcCtx *svc.ServiceContext) *RefreshTokenLogic {
	return &RefreshTokenLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *RefreshTokenLogic) RefreshToken(req *types.RefreshTokenReq) (resp *types.RefreshTokenResp, err error) {
	userId, err := tool.GetIdFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	token, err := jwt.ParseWithClaims(req.RefreshToken, &jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(l.svcCtx.Config.JwtAuth.AccessSecret), nil
	})
	if err != nil {
		return nil, err
	}
	if token.Valid {
		token, err := tool.GenJwtToken(l.svcCtx.Config.JwtAuth.AccessSecret, time.Now().Unix(), l.svcCtx.Config.JwtAuth.AccessExpire, fmt.Sprint(userId))
		if err != nil {
			return nil, err
		}
		refreshToken, err := tool.GenJwtToken(l.svcCtx.Config.JwtAuth.AccessSecret, time.Now().Unix(), l.svcCtx.Config.JwtAuth.RefreshExpire, fmt.Sprint(userId))
		if err != nil {
			return nil, err
		}

		return &types.RefreshTokenResp{
			AccessToken:   token.AccessToken,
			AccessExpire:  token.AccessExpire,
			RefreshToken:  refreshToken.AccessToken,
			RefreshExpire: refreshToken.AccessExpire,
		}, nil

	}

	return nil, errors.New("token无效")
}

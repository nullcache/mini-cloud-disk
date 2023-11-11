package user

import (
	"context"
	"fmt"

	"github.com/nullcache/mini-cloud-disk/common/tool"
	"github.com/nullcache/mini-cloud-disk/internal/svc"
	"github.com/nullcache/mini-cloud-disk/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/core/stores/sqlc"
)

type UserDetailsLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUserDetailsLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UserDetailsLogic {
	return &UserDetailsLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UserDetailsLogic) UserDetails() (resp *types.UserDetailsResp, err error) {
	id, err := tool.GetIdFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	user, err := l.svcCtx.UserModel.FindOne(l.ctx, id)
	if err != nil && err != sqlc.ErrNotFound {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("用户不存在")
	}
	return &types.UserDetailsResp{
		Id:       fmt.Sprint(user.Id),
		Username: user.Username,
		Email:    user.Email,
	}, nil
}

package svc

import (
	"github.com/bwmarrin/snowflake"
	"github.com/nullcache/mini-cloud-disk/internal/config"
	"github.com/nullcache/mini-cloud-disk/internal/model"
	"github.com/zeromicro/go-zero/core/stores/redis"
)

type ServiceContext struct {
	Config        config.Config
	UserModel     model.UserModel
	Redis         *redis.Redis
	SnowFlakeNode *snowflake.Node
}

func NewServiceContext(c config.Config) *ServiceContext {
	conn := MustInitMysql(c)

	return &ServiceContext{
		Config:        c,
		UserModel:     model.NewUserModel(conn),
		Redis:         MustInitRedis(c),
		SnowFlakeNode: MustInitSnowFlake(),
	}
}

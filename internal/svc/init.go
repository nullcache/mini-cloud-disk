package svc

import (
	"github.com/bwmarrin/snowflake"
	"github.com/nullcache/mini-cloud-disk/internal/config"
	"github.com/zeromicro/go-zero/core/stores/redis"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

func MustInitMysql(c config.Config) sqlx.SqlConn {
	conn := sqlx.NewMysql(c.DB.DataSource)
	if db, err := conn.RawDB(); err != nil {
		panic(err)
	} else if err := db.Ping(); err != nil {
		panic(err)
	}
	return conn
}

func MustInitRedis(c config.Config) *redis.Redis {
	return redis.MustNewRedis(redis.RedisConf{
		Host: c.Redis.Host,
		Type: c.Redis.Type,
		Pass: c.Redis.Pass,
		Tls:  c.Redis.Tls,
	})
}

func MustInitSnowFlake() *snowflake.Node {
	node, err := snowflake.NewNode(1)
	if err != nil {
		panic(err)
	}
	return node

}

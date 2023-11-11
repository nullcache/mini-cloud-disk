package main

import (
	"flag"
	"fmt"

	"github.com/nullcache/mini-cloud-disk/common/response"
	"github.com/nullcache/mini-cloud-disk/internal/config"
	"github.com/nullcache/mini-cloud-disk/internal/handler"
	"github.com/nullcache/mini-cloud-disk/internal/svc"

	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/rest"
	"github.com/zeromicro/go-zero/rest/httpx"
)

var configFile = flag.String("f", "etc/cloud-disk.yaml", "the config file")

func main() {
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)

	server := rest.MustNewServer(c.RestConf)
	defer server.Stop()

	ctx := svc.NewServiceContext(c)
	handler.RegisterHandlers(server, ctx)

	// 自定义成功返回
	httpx.SetOkHandler(response.OkHandler)
	// 自定义失败返回
	httpx.SetErrorHandlerCtx(response.ErrorHandler)

	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	server.Start()
}

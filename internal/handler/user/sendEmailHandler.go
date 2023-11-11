package user

import (
	"net/http"

	"github.com/nullcache/mini-cloud-disk/internal/logic/user"
	"github.com/nullcache/mini-cloud-disk/internal/svc"
	"github.com/nullcache/mini-cloud-disk/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func SendEmailHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.SendEmailReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := user.NewSendEmailLogic(r.Context(), svcCtx)
		err := l.SendEmail(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.Ok(w)
		}
	}
}

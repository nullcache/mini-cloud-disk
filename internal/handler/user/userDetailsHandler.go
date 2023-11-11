package user

import (
	"net/http"

	"github.com/nullcache/mini-cloud-disk/internal/logic/user"
	"github.com/nullcache/mini-cloud-disk/internal/svc"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func UserDetailsHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		l := user.NewUserDetailsLogic(r.Context(), svcCtx)
		resp, err := l.UserDetails()
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}

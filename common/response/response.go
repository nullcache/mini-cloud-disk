package response

import (
	"context"
)

type Body struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

func OkHandler(ctx context.Context, resp any) any {
	return Body{
		Code: 200,
		Msg:  "ok",
		Data: resp,
	}
}

func ErrorHandler(ctx context.Context, err error) (int, any) {
	return 200, Body{
		Code: 400,
		Msg:  err.Error(),
		Data: nil,
	}
}

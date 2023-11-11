package user

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/nullcache/mini-cloud-disk/common/tool"
	"github.com/nullcache/mini-cloud-disk/internal/svc"
	"github.com/nullcache/mini-cloud-disk/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/core/stores/sqlc"
)

type SendEmailLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewSendEmailLogic(ctx context.Context, svcCtx *svc.ServiceContext) *SendEmailLogic {
	return &SendEmailLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *SendEmailLogic) SendEmail(req *types.SendEmailReq) error {
	user, err := l.svcCtx.UserModel.FindOneByEmail(l.ctx, req.Email)
	if err != nil && err != sqlc.ErrNotFound {
		return err
	}
	if user != nil {
		return fmt.Errorf("邮箱已被注册")
	}

	eMapArr, err := l.svcCtx.Redis.HmgetCtx(l.ctx, req.Email, "Code", "ExpireTime", "SendTimes", "TimeWindow")
	if err != nil {
		return err
	}
	if len(eMapArr) != 4 {
		return fmt.Errorf("验证码生成错误")
	}

	expireTime, _ := strconv.ParseInt(eMapArr[1], 10, 64)
	sendTimes, _ := strconv.ParseInt(eMapArr[2], 10, 64)
	timeWindow, _ := strconv.ParseInt(eMapArr[3], 10, 64)

	if expireTime > time.Now().Unix() {
		return fmt.Errorf("验证码已发送，请稍后再试")
	}
	if sendTimes >= int64(l.svcCtx.Config.MailVerification.SendLimitPerDay) && time.Now().Unix() < timeWindow {
		return fmt.Errorf("今日发送次数已达上限")
	}

	code := tool.GenRand(l.svcCtx.Config.MailVerification.CodeWords, l.svcCtx.Config.MailVerification.CodeLength)
	if time.Now().Unix() > timeWindow {
		sendTimes = 0
		timeWindow = time.Now().Unix() + 86400
	}

	err = l.svcCtx.Redis.HmsetCtx(l.ctx, req.Email, map[string]string{
		"SendTimes":  strconv.FormatInt(sendTimes+1, 10),
		"TimeWindow": strconv.FormatInt(timeWindow, 10),
		"ExpireTime": strconv.FormatInt(time.Now().Unix()+int64(l.svcCtx.Config.MailVerification.CodeExpire), 10),
		"Code":       code,
	})
	if err != nil {
		return err
	}
	err = tool.SendMail(l.svcCtx.Config, req.Email, code)
	if err != nil {
		return errors.New("验证码发送失败")
	}
	return nil
}

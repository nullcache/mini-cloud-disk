package config

import "github.com/zeromicro/go-zero/rest"

type Config struct {
	rest.RestConf
	JwtAuth struct {
		AccessSecret  string
		AccessExpire  int64 `json:",default=86400"`
		RefreshExpire int64 `json:",default=172800"`
	}
	DB struct {
		DataSource string
	}
	Redis struct {
		Host string
		Type string `json:",default=node,options=node|cluster"`
		Pass string `json:",optional"`
		Tls  bool   `json:",optional"`
	}
	MailVerification struct {
		Host            string `json:",default=smtp.163.com"`
		Port            int    `json:",default=465"`
		Username        string `json:",env=MAIL_USERNAME"`
		Password        string `json:",env=MAIL_PASSWORD"`
		CodeLength      int    `json:",default=6"`
		CodeExpire      int    `json:",default=300"`
		CodeWords       string `json:",default=0123456789"`
		SendLimitPerDay int    `json:",default=5"`
	}
}

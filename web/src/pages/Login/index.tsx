import { useNavigate } from "react-router-dom";

import { login, register, sendEmailCode } from "@/service/api/login";
import { LockOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import {
  LoginFormPage,
  ProConfigProvider,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
  ProFormInstance,
} from "@ant-design/pro-components";
import { Tabs, message, theme } from "antd";
import { useEffect, useRef, useState } from "react";
import { getAccessToken, setToken } from "@/utils/auth";
import { TokenType } from "@/service/api/login/types";

type LoginType = "login" | "register";

const LoginForm = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<LoginType>("login");
  const { token } = theme.useToken();
  const formRef = useRef<ProFormInstance>();
  return (
    <div
      style={{
        backgroundColor: "white",
        height: "100vh",
      }}
    >
      <LoginFormPage
        formRef={formRef}
        // backgroundImageUrl="https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*y0ZTS6WLwvgAAAAAAAAAAAAADml6AQ/fmt.webp"
        // logo="https://github.githubassets.com/images/modules/logos_page/Octocat.png"
        backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"
        title="Pan"
        containerStyle={{
          backgroundColor: "rgba(0, 0, 0,0.65)",
          backdropFilter: "blur(4px)",
        }}
        subTitle="一个简易网盘"
        actions={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          ></div>
        }
        submitter={{
          // 配置按钮文本
          searchConfig: {
            submitText: loginType === "login" ? "登录" : "注册",
          },
        }}
        onFinish={async (values) => {
          if (loginType === "register") {
            await register(values);
            message.success("注册成功！");
            formRef.current?.resetFields([
              "username",
              "password",
              "email",
              "code",
            ]);
            setLoginType("login");
          } else {
            const {
              access_expire: accessExpire,
              access_token: accessToken,
              refresh_expire: refreshExpire,
              refresh_token: refreshToken,
            } = await login(values);

            const token: TokenType = {
              accessToken,
              refreshToken,
              accessExpire,
              refreshExpire,
            };

            setToken(token);
            navigate("/", {
              replace: true,
            });
          }
        }}
      >
        <Tabs
          centered
          activeKey={loginType}
          onChange={(activeKey) => setLoginType(activeKey as LoginType)}
        >
          <Tabs.TabPane key={"login"} tab={"登录"} />
          <Tabs.TabPane key={"register"} tab={"注册"} />
        </Tabs>
        {loginType === "login" && (
          <>
            <ProFormText
              name="username"
              fieldProps={{
                size: "large",
                prefix: (
                  <UserOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={"prefixIcon"}
                  />
                ),
              }}
              placeholder={"用户名"}
              rules={[
                {
                  required: true,
                  message: "请输入用户名!",
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: "large",
                prefix: (
                  <LockOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={"prefixIcon"}
                  />
                ),
              }}
              placeholder={"密码"}
              rules={[
                {
                  required: true,
                  message: "请输入密码！",
                },
              ]}
            />
          </>
        )}
        {loginType === "register" && (
          <>
            <ProFormText
              fieldProps={{
                size: "large",
                prefix: (
                  <MailOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={"prefixIcon"}
                  />
                ),
              }}
              name="email"
              placeholder={" 邮箱"}
              rules={[
                {
                  required: true,
                  message: "请输入邮箱",
                },
                {
                  pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
                  message: "邮箱格式错误！",
                },
              ]}
            />
            <ProFormCaptcha
              fieldProps={{
                size: "large",
                prefix: (
                  <LockOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={"prefixIcon"}
                  />
                ),
              }}
              captchaProps={{
                size: "large",
              }}
              placeholder={"请输入验证码"}
              captchaTextRender={(timing, count) => {
                if (timing) {
                  return `${count} ${"获取验证码"}`;
                }
                return "获取验证码";
              }}
              name="code"
              rules={[
                {
                  required: true,
                  message: "请输入验证码！",
                },
              ]}
              onGetCaptcha={async () => {
                const email: string = await formRef.current?.getFieldValue?.(
                  "email"
                );
                // 如果不是邮箱
                const pattern = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
                if (!email || !pattern.test(email)) {
                  message.error("请输入正确的邮箱！");
                  throw new Error("wrong email");
                }
                await sendEmailCode(email);
                message.success("验证码发送成功，请检查收件箱或垃圾箱");
              }}
            />
            <ProFormText
              name="username"
              fieldProps={{
                size: "large",
                prefix: (
                  <UserOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={"prefixIcon"}
                  />
                ),
              }}
              placeholder={"用户名"}
              rules={[
                {
                  required: true,
                  message: "请输入用户名!",
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: "large",
                prefix: (
                  <LockOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={"prefixIcon"}
                  />
                ),
              }}
              placeholder={"密码"}
              rules={[
                {
                  required: true,
                  message: "请输入密码！",
                },
              ]}
            />
          </>
        )}
        <div
          style={{
            marginBlockEnd: 24,
          }}
        >
          <ProFormCheckbox noStyle name="autoLogin">
            自动登录
          </ProFormCheckbox>
          <a
            style={{
              float: "right",
            }}
          >
            忘记密码
          </a>
        </div>
      </LoginFormPage>
    </div>
  );
};

export default function Login() {
  const navigate = useNavigate();
  const token = getAccessToken();
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <ProConfigProvider dark>
      <LoginForm />
    </ProConfigProvider>
  );
}

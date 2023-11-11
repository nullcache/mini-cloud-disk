import request from "@/service/axios";
import { getRefreshToken } from "@/utils/auth";
import type { UserLoginVO, UserRegisterVO, UserVO } from "./types";

export interface SmsLoginVO {
  mobile: string;
  code: string;
}

// 登录
export const login = (data: UserLoginVO) => {
  return request.post({
    url: "/user/login",
    data,
  });
};

// 刷新访问令牌
export const _refreshToken = () => {
  return request.post({
    url: "/user/refresh-token",
    data: {
      refresh_token: getRefreshToken(),
    },
  });
};

// 登出
export const loginOut = () => {
  return request.post({ url: "/user/logout" });
};

// 注册
export const register = (data: UserRegisterVO) => {
  return request.post({
    url: "/user/register",
    data,
  });
};

//获取注册验证码
export const sendEmailCode = (email: string) => {
  return request.post({ url: "/user/sendEmail", data: { email } });
};

// 获取用户信息
export const userDetails = () => {
  return request.get<UserVO>({ url: "/user/details" });
};

export type UserLoginVO = {
  username: string;
  password: string;
  // captchaVerification: string
};

export type UserRegisterVO = {
  username: string;
  password: string;
  email: string;
  code: string;
};

export type TokenType = {
  accessToken: string; // 访问令牌
  refreshToken: string; // 刷新令牌
  userId?: number; // 用户编号
  // userType: number; //用户类型
  accessExpire: number; // 访问令牌过期时间
  refreshExpire: number; // 刷新令牌过期时间
  // expiresTime: number; //过期时间
};

export type UserVO = {
  id: number;
  username: string;
  email: string;
};

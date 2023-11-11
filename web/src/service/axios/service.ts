/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import qs from "qs";
import { config } from "./config";
import {
  getAccessToken,
  getRefreshToken,
  removeToken,
  setToken,
} from "@/utils/auth";
import errorCode from "./errorCode";

import { newCache } from "@/utils/newCache";
import { Modal, message, notification } from "antd";
import { TokenType } from "../api/login/types";

const { result_code, base_url, request_timeout } = config;

// 需要忽略的提示。忽略后，自动 Promise.reject('error')
const ignoreMsgs = [
  "无效的刷新令牌", // 刷新令牌被删除时，不用提示
  "刷新令牌已过期", // 使用刷新令牌，刷新获取新的访问令牌时，结果因为过期失败，此时需要忽略。否则，会导致继续 401，无法跳转到登出界面
];
// 是否显示重新登录
export const isRelogin = { show: false };
// Axios 无感知刷新令牌，参考 https://www.dashingdog.cn/article/11 与 https://segmentfault.com/a/1190000020210980 实现
// 请求队列
let requestList: any[] = [];
// 是否正在刷新中
let isRefreshToken = false;
// 请求白名单，无须token的接口
const whiteList: string[] = ["/login", "/refresh-token"];

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: base_url, // api 的 base_url
  timeout: request_timeout, // 请求超时时间
  withCredentials: false, // 禁用 Cookie 等信息
});

// request拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 是否需要设置 token
    let isToken = (config!.headers || {}).isToken === false;
    whiteList.some((v) => {
      if (config.url) {
        config.url.indexOf(v) > -1;
        return (isToken = false);
      }
    });
    if (getAccessToken() && !isToken) {
      (config as Recordable).headers.Authorization =
        "Bearer " + getAccessToken(); // 让每个请求携带自定义token
    }

    const params = config.params || {};
    const data = config.data || false;
    if (
      config.method?.toUpperCase() === "POST" &&
      (config.headers as AxiosRequestHeaders)["Content-Type"] ===
        "application/x-www-form-urlencoded"
    ) {
      config.data = qs.stringify(data);
    }
    // get参数编码
    if (config.method?.toUpperCase() === "GET" && params) {
      let url = config.url + "?";
      for (const propName of Object.keys(params)) {
        const value = params[propName];
        if (
          value !== void 0 &&
          value !== null &&
          typeof value !== "undefined"
        ) {
          if (typeof value === "object") {
            for (const val of Object.keys(value)) {
              const params = propName + "[" + val + "]";
              const subPart = encodeURIComponent(params) + "=";
              url += subPart + encodeURIComponent(value[val]) + "&";
            }
          } else {
            url += `${propName}=${encodeURIComponent(value)}&`;
          }
        }
      }
      // 给 get 请求加上时间戳参数，避免从缓存中拿数据
      // const now = new Date().getTime()
      // params = params.substring(0, url.length - 1) + `?_t=${now}`
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }
    return config;
  },
  (error: AxiosError) => {
    // Do something with request error
    console.log(error); // for debug
    Promise.reject(error);
  }
);

// response 拦截器
service.interceptors.response.use(
  async (response: AxiosResponse<any>) => {
    const { data } = response;
    const config = response.config;
    if (!data) {
      // 返回“[HTTP]请求没有返回值”;
      throw new Error();
    }
    // 未设置状态码则默认成功状态
    const code: number = data.code || result_code;
    // 二进制数据则直接返回
    if (
      response.request.responseType === "blob" ||
      response.request.responseType === "arraybuffer"
    ) {
      return response.data;
    }
    // 获取错误信息
    const msg = data.msg || errorCode[code] || errorCode["default"];

    if (ignoreMsgs.indexOf(msg) !== -1) {
      // 如果是忽略的错误码，直接返回 msg 异常
      return Promise.reject(msg);
    } else if (code === 401) {
      // 如果未认证，并且未进行刷新令牌，说明可能是访问令牌过期了
      if (!isRefreshToken) {
        isRefreshToken = true;
        // 1. 如果获取不到刷新令牌，则只能执行登出操作
        if (!getRefreshToken()) {
          return handleAuthorized();
        }
        // 2. 进行刷新访问令牌
        try {
          const res = await refreshToken();

          const { access_expire, access_token, refresh_expire, refresh_token } =
            res.data.data;
          // 2.1 刷新成功，则回放队列的请求 + 当前请求
          setToken({
            accessExpire: access_expire,
            accessToken: access_token,
            refreshExpire: refresh_expire,
            refreshToken: refresh_token,
          });

          config.headers!.Authorization = "Bearer " + getAccessToken();
          requestList.forEach((cb: any) => {
            cb();
          });
          requestList = [];
          return service(config);
        } catch (e) {
          // 为什么需要 catch 异常呢？刷新失败时，请求因为 Promise.reject 触发异常。
          // 2.2 刷新失败，只回放队列的请求
          requestList.forEach((cb: any) => {
            cb();
          });
          // 提示是否要登出。即不回放当前请求！不然会形成递归
          return handleAuthorized();
        } finally {
          requestList = [];
          isRefreshToken = false;
        }
      } else {
        // 添加到队列，等待刷新获取到新的令牌
        return new Promise((resolve) => {
          requestList.push(() => {
            config.headers!.Authorization = "Bearer " + getAccessToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
            resolve(service(config));
          });
        });
      }
    } else if (code === 500) {
      message.error("服务器错误，请联系管理员");
      return Promise.reject(new Error(msg));
    } else if (code !== 200) {
      if (msg === "无效的刷新令牌") {
        // hard coding：忽略这个提示，直接登出
        console.log(msg);
      } else {
        notification.error({ message: msg });
      }
      return Promise.reject("error");
    } else {
      return data;
    }
  },
  async (error: AxiosError) => {
    const response = error.response;
    const status = response?.status;
    const config = response?.config;

    if (status === 401) {
      // 如果未认证，并且未进行刷新令牌，说明可能是访问令牌过期了
      if (!isRefreshToken) {
        isRefreshToken = true;
        // 1. 如果获取不到刷新令牌，则只能执行登出操作
        if (!getRefreshToken()) {
          return handleAuthorized();
        }
        // 2. 进行刷新访问令牌
        try {
          const res = await refreshToken();

          const { access_expire, access_token, refresh_expire, refresh_token } =
            res.data.data;

          // 2.1 刷新成功，则回放队列的请求 + 当前请求
          setToken({
            accessExpire: access_expire,
            accessToken: access_token,
            refreshExpire: refresh_expire,
            refreshToken: refresh_token,
          });
          config!.headers!.Authorization = "Bearer " + getAccessToken();
          requestList.forEach((cb: any) => {
            cb();
          });
          requestList = [];
          return service(config);
        } catch (e) {
          // 为什么需要 catch 异常呢？刷新失败时，请求因为 Promise.reject 触发异常。
          // 2.2 刷新失败，只回放队列的请求
          requestList.forEach((cb: any) => {
            cb();
          });
          // 提示是否要登出。即不回放当前请求！不然会形成递归
          return handleAuthorized();
        } finally {
          requestList = [];
          isRefreshToken = false;
        }
      } else {
        // 添加到队列，等待刷新获取到新的令牌
        return new Promise((resolve) => {
          requestList.push(() => {
            config!.headers!.Authorization = "Bearer " + getAccessToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
            console.log(service(config));
            resolve(service(config));
          });
        });
      }
    } else if (status === 500) {
      message.error("服务器错误，请联系管理员");
      return Promise.reject(error);
    }

    console.log("err" + error); // for debug
    let { message: msg }: { message: string } = error;
    if (msg === "Network Error") {
      msg = "操作失败，系统异常！";
    } else if (msg.includes("timeout")) {
      msg = "接口请求超时，请刷新页面重试！";
    } else if (msg.includes("Request failed with status code")) {
      msg = "请求出错，请稍后重试" + msg.substr(msg.length - 3);
    }
    message.error(msg);
    return Promise.reject(error);
  }
);

// 单独写是为了不想走service实例的拦截器
const refreshToken = async () => {
  return await axios.post(base_url + "/user/refresh-token", {
    refresh_token: getRefreshToken(),
  });
};

const handleAuthorized = () => {
  if (!isRelogin.show) {
    isRelogin.show = true;
    Modal.confirm({
      title: "系统提示",
      content: "登录状态已过期，请重新登录",
      okText: "重新登录",
      closable: false,
      maskClosable: false,
      cancelButtonProps: {
        style: {
          display: "none",
        },
      },
      onOk: () => {
        const { wsCache } = newCache();
        wsCache.clear();
        removeToken();
        isRelogin.show = false;
        // 干掉token后再走一次路由让它过router.beforeEach的校验
        // window.location.href = window.location.href
        window.location.reload();
      },
    });
  }
  return Promise.reject("登录超时，请重新登录！");
};
export { service };

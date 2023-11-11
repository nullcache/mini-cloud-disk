import { loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import type { UserConfig, ConfigEnv } from "vite";
import { resolve } from "path";

// 当前执行node命令时文件夹的地址(工作目录)
const root = process.cwd();

// 路径查找
function pathResolve(dir: string) {
  return resolve(root, ".", dir);
}

// https://vitejs.dev/config/
export default ({ mode }: ConfigEnv): UserConfig => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return {
    plugins: [react()],
    resolve: {
      extensions: [
        ".mjs",
        ".js",
        ".ts",
        ".jsx",
        ".tsx",
        ".json",
        ".scss",
        ".css",
      ],
      alias: [
        {
          find: /\@\//,
          replacement: `${pathResolve("src")}/`,
        },
      ],
    },
    base: process.env.BASE_PATH,
    root: root,
    // 服务端渲染
    server: {
      // 是否开启 https
      https: false,
      // 端口号
      // 本地跨域代理. 目前注释的原因：暂时没有用途，server 端已经支持跨域
      proxy: {
        "/api": {
          target: "http://127.0.0.1:9999/",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
};

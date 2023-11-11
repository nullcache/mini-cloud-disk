import React from "react";
import AuthRoute from "@/components/AuthRoute";
import { Result } from "antd";
import { Navigate } from "react-router";

const Login = React.lazy(() => import("@/pages/Login"));
const BasicLayout = React.lazy(() => import("@/components/BasicLayout"));
const Hello = React.lazy(() => import("@/pages/Hello"));

interface Path {
  path: string;
  element: React.ReactNode;
  children?: Path[];
}

const protectRoutes: Path[] = [
  {
    path: "/hello",
    element: <Hello />,
  },
];

const routes = [
  {
    path: "/",
    element: <Navigate to="/hello" replace />,
  },
  {
    path: "/",
    element: <AuthRoute Component={BasicLayout} />,
    children: protectRoutes,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "*",
    element: (
      <Result status="404" title="404" subTitle="你好像来到了一片荒漠。" />
    ),
  },
];

export default routes;

export { protectRoutes };

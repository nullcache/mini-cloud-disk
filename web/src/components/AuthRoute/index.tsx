import { getAccessToken } from "@/utils/auth";
import { Navigate } from "react-router";
import React from "react";

export default function AuthRoute({ Component }: { Component: React.FC }) {
  const hasToken = !!getAccessToken();
  return hasToken ? <Component /> : <Navigate to="/login" />;
}

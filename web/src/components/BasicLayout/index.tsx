import { Suspense } from "react";
import { Outlet } from "react-router";

export default function BasicLayout() {
  return (
    <div>
      <Suspense fallback="">
        <Outlet />
      </Suspense>
    </div>
  );
}

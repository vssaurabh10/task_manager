import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/auth-store";

export function ProtectedRoute() {
  const { user, bootstrapped, bootstrap } = useAuthStore();

  useEffect(() => {
    if (!bootstrapped) void bootstrap();
  }, [bootstrap, bootstrapped]);

  if (!bootstrapped) return <div className="grid min-h-screen place-items-center bg-background text-sm text-slate-500">Loading workspace...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

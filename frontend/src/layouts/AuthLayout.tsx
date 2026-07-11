import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export function AuthLayout() {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}

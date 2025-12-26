import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";
import { useProfileQuery } from "../features/profile/profileQueries";

function isAdminRole(role: string | null | undefined) {
  if (!role) return false;
  const r = role.toUpperCase();
  return r === "ADMIN" || r === "ROLE_ADMIN";
}

/**
 * AdminRoute.
 */
export function AdminRoute() {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const location = useLocation();

  
  if (!hydrated) return null;

  if (!token) {
    const from = location.pathname + location.search;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  
  const { data: profile, isLoading } = useProfileQuery(true);

  if (isLoading) return null;

  if (!isAdminRole(profile?.role ?? null)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";

/**
 * ProtectedRoute.
 */
export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const location = useLocation();

  
  if (!hydrated) return null;

  if (!token) {
    const from = location.pathname + location.search; 
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return <Outlet />;
}
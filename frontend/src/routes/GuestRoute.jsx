import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

/**
 * The inverse of ProtectedRoute: for pages that only make sense
 * signed *out* (Login, Register, Forgot/Reset Password). Deliberately
 * separate from PublicLayout, which still wraps Home — Home has no
 * reason to redirect a logged-in user away, only these four do.
 */
const GuestRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;

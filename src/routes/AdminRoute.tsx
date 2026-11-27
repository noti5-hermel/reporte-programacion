import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated && !localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(["ADMIN"])) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoginForm from "../features/auth/components/LoginForm";

export default function LoginPage() {
  const { isAuthenticated, authServiceAvailable } = useAuth();

  if (isAuthenticated) return <Navigate to="/general" replace />;

  if (authServiceAvailable === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-primary">
        <p className="text-subtitle font-bold">Verificando disponibilidad del servicio de autenticación...</p>
      </div>
    );
  }

  if (authServiceAvailable === false) return <LoginForm />;

  return (
    <div className="flex items-center justify-center h-screen bg-background-primary">
      <p className="text-subtitle font-bold">Redirigiendo al inicio de sesión...</p>
    </div>
  );
}

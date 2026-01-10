import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute: React.FC = () => {
  // Se elimina `hasRole` porque ya no existe en el contexto.
  const { isAuthenticated } = useAuth();

  // Si el usuario no está autenticado, se le redirige a la página de login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se elimina la comprobación de roles. Ahora, cualquier usuario autenticado
  // puede acceder a la ruta.

  // Si el usuario está autenticado, se muestra el contenido de la ruta protegida.
  return <Outlet />;
};

export default PrivateRoute;

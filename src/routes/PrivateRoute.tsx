import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (!hasRole(['admin', 'accounting'])) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default PrivateRoute;

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import LoginPage from "../pages/LoginPage";
import General from "../pages/General";
import Resumen from "../pages/Resumen";
import Rendimiento from "../pages/Rendimiento";
import Comparacion from "../pages/Comparacion";
import FormatoPage from "../pages/FormatoPage";
import DisponibilidadPage from "../pages/Disponibilidad";
import GestionPermisos from "../pages/GestionPermisos";
import PrivateRoute from "./PrivateRoute";

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
    ],
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/general" replace /> },
      {
        path: "/general",
        element: (
          <PrivateRoute>
            <General />
          </PrivateRoute>
        ),
      },
      {
        path: "/resumen",
        element: (
          <PrivateRoute>
            <Resumen />
          </PrivateRoute>
        ),
      },
      {
        path: "/rendimiento",
        element: (
          <PrivateRoute>
            <Rendimiento />
          </PrivateRoute>
        ),
      },
      {
        path: "/comparacion",
        element: (
          <PrivateRoute>
            <Comparacion />
          </PrivateRoute>
        ),
      },
      {
        path: "/formato",
        element: (
          <PrivateRoute>
            <FormatoPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/disponibilidad",
        element: (
          <PrivateRoute>
            <DisponibilidadPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/permisos",
        element: (
          <PrivateRoute>
            <GestionPermisos />
          </PrivateRoute>
        ),
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}

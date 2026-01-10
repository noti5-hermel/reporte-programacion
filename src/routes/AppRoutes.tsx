import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import General from "../pages/General";
import Resumen from "../pages/Resumen";
import Login from "../pages/Login/LoginPage";
import Comparacion from "../pages/Comparacion";
import FormatoPage from "../pages/FormatoPage/index"; 
import DisponibilidadPage from "../pages/Disponibilidad";
import PrivateRoute from "./PrivateRoute";
import { useAuth } from "../contexts/AuthContext";

const AppLayout = () => (
  <div className="flex">
    <Sidebar />
    <main className="flex-grow p-4">
      <Outlet />
    </main>
  </div>
);

export const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth(); // <-- Obtener el estado 'loading'

  // Si aún estamos comprobando la autenticación, muestra un loader.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Ruta para el login */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/general" replace />}
        />
        
        {/* Rutas Protegidas */}
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/general" element={<General />} />
          <Route path="/resumen" element={<Resumen />} />
          <Route path="/comparacion" element={<Comparacion />} />
          <Route path="/formato" element={<FormatoPage />} />
          <Route path="/disponibilidad" element={<DisponibilidadPage />} />
          {/* Redirección por defecto si el usuario está logueado */}
          <Route path="*" element={<Navigate to="/general" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

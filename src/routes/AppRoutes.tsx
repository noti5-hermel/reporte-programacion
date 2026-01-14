import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import General from "../pages/General";
import Resumen from "../pages/Resumen";
import Login from "../pages/Login/LoginPage";
import Comparacion from "../pages/Comparacion";
import FormatoPage from "../pages/FormatoPage"; 
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
  const { isAuthenticated } = useAuth();

  // Muestra una pantalla de carga mientras se verifica la autenticación.
  /*if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Cargando aplicación...</p>
      </div>
    );
  }*/

  return (
    <Router>
      <Routes>
        {/* Si el usuario está autenticado, la ruta raíz lo redirige a /general.
            Si no, lo redirige a /login. */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/general" replace /> : <Navigate to="/login" replace />} 
        />
        
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/general" replace />} 
        />

        {/* --- ESTRUCTURA DE RUTAS PROTEGIDAS CORREGIDA --- */}
        {/* Primero, el PrivateRoute actúa como guardián. */}
        <Route element={<PrivateRoute />}>
          {/* Si se pasa el guardián, se renderiza el AppLayout (con el Sidebar). */}
          <Route element={<AppLayout />}>
            {/* El <Outlet> dentro de AppLayout renderizará estas rutas hijas. */}
            <Route path="/general" element={<General />} />
            <Route path="/resumen" element={<Resumen />} />
            <Route path="/comparacion" element={<Comparacion />} />
            <Route path="/formato" element={<FormatoPage />} />
            <Route path="/disponibilidad" element={<DisponibilidadPage />} />
          </Route>
        </Route>
        
        {/* Cualquier otra ruta no definida redirige a la página principal. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};
import { BrowserRouter as Router, Routes, Route, Outlet,Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import General from "../pages/General";
import Resumen from "../pages/Resumen";
import Login  from "../pages/Login/LoginPage";
import Comparacion from "../pages/Comparacion";
import FormatoPage from "../pages/FormatoPage/index"; 
import DisponibilidadPage from "../pages/Disponibilidad"; // Importar la nueva página
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

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/general" replace /> : <Login />}
        />
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/general" element={<General />} />
            <Route path="/resumen" element={<Resumen />} />
            <Route path="/comparacion" element={<Comparacion />} />
            <Route path="/formato" element={<FormatoPage />} />
            <Route path="/disponibilidad" element={<DisponibilidadPage />} /> {/* Añadir la nueva ruta */}
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

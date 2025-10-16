import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import General from "../pages/General";
import Resumen from "../pages/Resumen";
import LoginPage from "../pages/Login/LoginPage";
import PrivateRoute from "./PrivateRoute";

const AppLayout = () => (
  <div className="flex">
    <Sidebar />
    <main className="flex-grow p-4">
      <Outlet />
    </main>
  </div>
);

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/general" element={<General />} />
            <Route path="/resumen" element={<Resumen />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

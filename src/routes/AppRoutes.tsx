import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import General from "../pages/General";
import Resumen from "../pages/Resumen";

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
        <Route path="/" element={<AppLayout />}>
          <Route index element={<General />} />
          <Route path="resumen" element={<Resumen />} />
        </Route>
      </Routes>
    </Router>
  );
};

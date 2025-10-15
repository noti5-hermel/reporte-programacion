import { Routes, Route } from "react-router-dom";
import General from "../pages/General";
import Resumen from "../pages/Resumen";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<General />} />
      <Route path="/resumen" element={<Resumen />} />
    </Routes>
  );
};

export default AppRoutes;

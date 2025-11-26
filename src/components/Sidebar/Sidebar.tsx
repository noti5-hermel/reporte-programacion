import SidebarItem from "./SidebarItem";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="h-screen w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-2xl font-semibold">Mi App</h2>
      </div>
      <nav className="flex-grow">
        <SidebarItem to="/general" label="General" />
        <SidebarItem to="/resumen" label="Resumen" />
        <SidebarItem to="/comparacion" label="Comparacion" />
        <SidebarItem to="/formato" label="Formato" />
      </nav>
      <div className="p-4 border-t border-gray-700">
        <p className="text-sm">Bienvenido, {user?.username}</p>
        <button
          onClick={handleLogout}
          className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
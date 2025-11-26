import { useState } from "react";
import { SidebarItem } from "./SidebarItem";
import { ChevronLeft, LayoutDashboard, ClipboardList, GitCompareArrows } from "lucide-react";
import {LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();

  return (
    <aside
      className={`min-h-screen sticky top-0 bg-slate-800 text-white p-4 transition-all duration-300 ease-in-out flex flex-col justify-between flex-shrink-0 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-xl font-bold transition-opacity duration-300 ${
              isCollapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            Panel
          </h2>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600"
          >
            <ChevronLeft
              className={`transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <SidebarItem
            to="/general"
            label="Tabla General"
            isCollapsed={isCollapsed}
            icon={<LayoutDashboard />}
          />
          <SidebarItem
            to="/resumen"
            label="Tabla Resumida"
            isCollapsed={isCollapsed}
            icon={<ClipboardList />}
          />
          <SidebarItem
            to="/comparacion"
            label="Comparación"
            isCollapsed={isCollapsed}
            icon={<GitCompareArrows />}
          />
        </nav>
      </div>

      <div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 p-2 rounded-lg hover:bg-slate-700"
        >
          <LogOut />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
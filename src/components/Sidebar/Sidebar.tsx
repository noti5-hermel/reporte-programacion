import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight, Table, BarChart2 } from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isCollapsed, toggleSidebar }: SidebarProps) => {
  return (
    <aside
      className={`bg-venice-blue text-white flex flex-col p-4 shadow-lg transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        {!isCollapsed && (
          <h2 className="text-2xl font-extrabold ml-2">Panel</h2>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-fountain-blue focus:outline-none focus:ring-2 focus:ring-fountain-blue"
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      <nav className="flex flex-col gap-4">
        <SidebarItem
          to="/"
          label="Tabla General"
          icon={<Table size={20} />}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          to="/resumen"
          label="Tabla Resumida"
          icon={<BarChart2 size={20} />}
          isCollapsed={isCollapsed}
        />
      </nav>
    </aside>
  );
};

interface SidebarItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  isCollapsed: boolean;
}

const SidebarItem = ({ to, label, icon, isCollapsed }: SidebarItemProps) => {
  const baseClasses =
    "flex items-center gap-4 p-3 rounded-lg text-sm font-medium transition-colors";
  const activeClasses = "bg-fountain-blue text-white font-semibold";
  const inactiveClasses = "hover:bg-venice-blue text-gallery";

  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
      }
    >
      {icon}
      {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
    </NavLink>
  );
};

export default Sidebar;

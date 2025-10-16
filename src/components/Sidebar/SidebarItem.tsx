import { NavLink } from "react-router-dom";
import { Table, BarChart2 } from "lucide-react";

interface SidebarItemProps {
  to: string;
  label: string;
  isCollapsed: boolean;
}

export const SidebarItem = ({ to, label, isCollapsed }: SidebarItemProps) => {
  const getIcon = (label: string) => {
    switch (label) {
      case "Tabla General":
        return <Table size={20} />;
      case "Tabla Resumida":
        return <BarChart2 size={20} />;
      default:
        return null;
    }
  };

  const baseClasses =
    "flex items-center gap-4 p-3 rounded-lg text-sm font-medium transition-colors";
  const activeClasses = "bg-blue-100 text-blue-700 font-semibold";
  const inactiveClasses = "hover:bg-gray-100 text-gray-600";

  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
      }
    >
      {getIcon(label)}
      {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
    </NavLink>
  );
};

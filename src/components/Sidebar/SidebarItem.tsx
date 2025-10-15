import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  to: string;
  label: string;
}

export const SidebarItem = ({ to, label }: SidebarItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
          isActive
            ? "bg-slate-600 text-white"
            : "text-gray-300 hover:bg-slate-700 hover:text-white"
        }`
      }
    >
      {label}
    </NavLink>
  );
};

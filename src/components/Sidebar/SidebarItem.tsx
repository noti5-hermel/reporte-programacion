import { NavLink } from "react-router-dom";
import React from "react";

interface SidebarItemProps {
  to: string;
  label: string;
  isCollapsed: boolean;
  icon: React.ReactNode;
}

export const SidebarItem = ({ to, label, isCollapsed, icon }: SidebarItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
          isActive
            ? "bg-slate-600 text-white"
            : "text-gray-300 hover:bg-slate-700 hover:text-white"
        } ${isCollapsed ? "justify-center" : ""}`
      }
    >
      <div className="flex-shrink-0">{icon}</div>
      <span
        className={`overflow-hidden transition-all whitespace-nowrap ${
          isCollapsed ? "w-0 ml-0" : "w-auto ml-4"
        }`}
      >
        {label}
      </span>
    </NavLink>
  );
};

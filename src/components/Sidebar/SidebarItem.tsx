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
        `flex items-center px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${
          isActive
            ? "bg-button-primary text-white shadow-btn-glow"
            : "text-subtitle hover:bg-background-primary hover:text-title"
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

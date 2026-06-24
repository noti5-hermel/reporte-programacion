import React, { useState, useEffect } from "react";
import { SidebarItem } from "./SidebarItem";
import { useAuth } from "../../hooks/useAuth";
import { permissionService, REPORT_OPTIONS } from "../../services/permissionService";
import {
  ChevronLeft,
  TableProperties,
  ClipboardList,
  Activity,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  reportKey: string;
}

const ALL_ITEMS: NavItem[] = [
  { to: "/general", label: "Tabla General", icon: <TableProperties />, reportKey: "general" },
  { to: "/rendimiento", label: "Rendimiento", icon: <Activity />, reportKey: "rendimiento" },
  { to: "/resumen", label: "Tabla Resumida", icon: <ClipboardList />, reportKey: "resumen" },
];

function useUserReports() {
  const { user } = useAuth();
  const [allowedReports, setAllowedReports] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!user?.username) return;

    const isAdmin = user.role === "ADMIN";
    if (isAdmin) {
      setAllowedReports(new Set(REPORT_OPTIONS.map((r) => r.key)));
      return;
    }

    const cached = localStorage.getItem("user_reports");
    if (cached) {
      try {
        setAllowedReports(new Set(JSON.parse(cached)));
        return;
      } catch {}
    }

    permissionService
      .getMyPermissions()
      .then((res) => {
        const reports = new Set(res.reports);
        setAllowedReports(reports);
        localStorage.setItem("user_reports", JSON.stringify([...reports]));
      })
      .catch(() => setAllowedReports(new Set()));
  }, [user?.username, user?.role]);

  return allowedReports;
}

const Sidebar = () => {
  const { user } = useAuth();
  const allowedReports = useUserReports();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const visibleItems = ALL_ITEMS.filter(
    (item) => isAdmin || allowedReports?.has(item.reportKey)
  );

  return (
    <aside
      className={`min-h-screen sticky top-0 bg-background-secondary border-r border-border-card p-4 transition-all duration-300 ease-in-out flex flex-col justify-between flex-shrink-0 ${isCollapsed ? "w-20" : "w-64"
        }`}
    >
      <div>
        <div className="flex items-center justify-between mb-6 mt-4">
          <h2
            className={`text-xl font-bold text-title transition-opacity duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"
              }`}
          >
            Panel
          </h2>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute z-50 p-2 rounded-xl bg-background-primary hover:bg-background-secondary text-subtitle hover:text-title shadow-sm border border-border-card transition-all ${isCollapsed
                ? "top-[22px] "
                : "top-4 right-1"
              }`}
          >
            <ChevronLeft
              className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""
                }`}
            />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {visibleItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              label={item.label}
              isCollapsed={isCollapsed}
              icon={item.icon}
            />
          ))}
        </nav>
      </div>

    </aside>
  );
};

export default Sidebar;

import { Navigate } from "react-router-dom";
import { useReportPermissions } from "../hooks/useReportPermissions";
import { ShieldOff } from "lucide-react";

const REPORT_ROUTES: { key: string; path: string }[] = [
  { key: "general", path: "/general" },
  { key: "rendimiento", path: "/rendimiento" },
  { key: "resumen", path: "/resumen" },
];

export default function ReportIndex() {
  const allowed = useReportPermissions();

  if (allowed === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-button-primary"></div>
      </div>
    );
  }

  const firstAllowed = REPORT_ROUTES.find((r) => allowed.has(r.key));
  if (firstAllowed) {
    return <Navigate to={firstAllowed.path} replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5">
      <div className="w-16 h-16 rounded-full bg-background-secondary border border-border-card flex items-center justify-center">
        <ShieldOff className="w-8 h-8 text-subtitle" />
      </div>
      <h2 className="text-xl font-bold text-title">Sin acceso a reportes</h2>
      <p className="text-sm text-subtitle text-center max-w-md">
        No tienes permisos para ver ningún reporte. Solicita al administrador que te brinde acceso a los reportes que necesitas.
      </p>
    </div>
  );
}

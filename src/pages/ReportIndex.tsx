import { Navigate } from "react-router-dom";
import { useReportPermissions } from "../hooks/useReportPermissions";
import NoAccess from "../components/NoAccess";

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
    <NoAccess
      title="Sin acceso a reportes"
      description="No tienes permisos para ver ningún reporte. Solicita al administrador que te brinde acceso a los reportes que necesitas."
    />
  );
}

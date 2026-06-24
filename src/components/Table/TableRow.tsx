// src/components/Table/TableRow.tsx
import React from "react";

interface RowProps {
  type: "general" | "resumen" | "rendimiento" | "operators";
  row: any;
}

// Función para formatear la fecha
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const TableRow: React.FC<RowProps> = ({ type, row }) => {

  const baseRowClass = "hover:bg-background-primary text-sm transition-colors";
  const cellClass = "px-3 py-2.5 border-b border-border-card";

  // --- Caso para la tabla General ---
  if (type === "general") {
    return (
      <tr className={baseRowClass}>
        <td className={cellClass}>{row.fecha}</td>
        <td className={cellClass}>{row.codigo}</td>
        <td className={cellClass}>{row.descripcion}</td>
        <td className={cellClass}>{row.lote}</td>
        <td className={cellClass}>{row.tipo}</td>
        <td className={cellClass}>{row.actividad}</td>
        <td className={`${cellClass} text-right`}>{row.productividad}</td>
        <td className={`${cellClass} text-right`}>{row.cantidad}</td>
        <td className={`${cellClass} text-right`}>{row.minutos}</td>
        <td className={`${cellClass} text-right`}>{row.personas}</td>
        <td className={`${cellClass} text-right`}>{row.totalHoras}</td>
      </tr>
    );
  }

  // --- Caso para la tabla de Resumen ---
  if (type === "resumen") {
    return (
      <tr className={baseRowClass}>
        <td className={cellClass}>{row.codigo}</td>
        <td className={cellClass}>{row.descripcion}</td>
        <td className={cellClass}>{row.tipo}</td>
        <td className={`${cellClass} text-right`}>{row.sumaTotalHoras}</td>
        <td className={`${cellClass} text-right`}>{row.sumCantidad}</td>
        <td className={`${cellClass} text-right`}>{row.promTiempoProducto}</td>
        <td className={`${cellClass} text-right`}>{row.numeroPersonas}</td>
        <td className={`${cellClass} text-right`}>{row.totalTiempoReal}</td>
      </tr>
    );
  }

  // --- Caso para la tabla de Operarios ---
  if (type === "operators") {
    const completionRate = row.completion_rate || 0;
    const rateColor = completionRate >= 85 ? 'text-green-600' : completionRate >= 60 ? 'text-yellow-600' : 'text-red-600';
    const productivity = row.real_productivity;

    return (
      <tr className={baseRowClass}>
        <td className={`${cellClass} font-bold`}>{row.operator_name || row.username || "-"}</td>
        <td className={cellClass}>{row.job_title || "-"}</td>
        <td className={cellClass}>{row.teams || "-"}</td>
        <td className={`${cellClass} text-right`}>{row.active_days || 0}</td>
        <td className={`${cellClass} text-right`}>{row.completed_tasks || 0}</td>
        <td className={`${cellClass} text-right`}>{row.total_real_quantity || 0}</td>
        <td className={`${cellClass} text-right font-mono`}>{row.total_real_minutes || 0}</td>
        <td className={`${cellClass} text-right font-bold ${rateColor}`}>
          {completionRate.toFixed(1)}%
        </td>
        <td className={`${cellClass} text-right font-mono`}>
          {productivity != null ? productivity.toFixed(2) : "-"}
        </td>
      </tr>
    );
  }

  // --- Caso para la tabla de Rendimiento ---
  const rend = row.rendimiento;
  const rendColor = rend !== null && rend !== undefined
    ? (rend >= 85 ? 'text-green-600 font-bold' : rend >= 60 ? 'text-yellow-600 font-bold' : 'text-red-600 font-bold')
    : 'text-subtitle';
  const formatTime = (val: string | null) => {
    if (!val) return "-";
    if (val.includes("T")) return val.slice(11, 19);
    if (val.length >= 8) return val.slice(0, 8);
    return val;
  };

  return (
    <tr className={baseRowClass}>
      <td className={`${cellClass} font-bold`}>{row.equipo || "-"}</td>
      <td className={cellClass}>{row.codigo || "-"}</td>
      <td className={cellClass}>{row.description || "-"}</td>
      <td className={cellClass}>{row.material || "-"}</td>
      <td className={cellClass}>{row.lote || "-"}</td>
      <td className={`${cellClass} text-right`}>{row.cantidad_planificada ?? "-"}</td>
      <td className={`${cellClass} text-right`}>{row.cantidad_real ?? "-"}</td>
      <td className={`${cellClass} text-center text-xs`}>{formatTime(row.inicio_planificado)}</td>
      <td className={`${cellClass} text-center text-xs`}>{formatTime(row.final_planificado)}</td>
      <td className={`${cellClass} text-right font-mono`}>{row.tiempo_planificado ?? "-"}</td>
      <td className={`${cellClass} text-center text-xs`}>{formatTime(row.inicio_real)}</td>
      <td className={`${cellClass} text-center text-xs`}>{formatTime(row.final_real)}</td>
      <td className={`${cellClass} text-right font-mono`}>{row.tiempo_real != null ? row.tiempo_real.toFixed(2) : "-"}</td>
      <td className={`${cellClass} text-right ${rendColor}`}>
        {rend != null ? `${rend.toFixed(2)}%` : "N/A"}
      </td>
      <td className={`${cellClass} text-xs max-w-[150px] truncate`} title={row.comentarios || ""}>
        {row.comentarios || "-"}
      </td>
    </tr>
  );
};

export default TableRow;

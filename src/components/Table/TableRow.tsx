// src/components/Table/TableRow.tsx
import React from "react";

interface RowProps {
  type: "general" | "resumen" | "disponibilidad" | "rendimiento" | "operators";
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

  // --- Caso para la tabla de Disponibilidad ---
  if (type === "disponibilidad") {
    return (
      <tr className="hover:bg-gray-50 text-sm">
        <td className="px-3 py-2 border-b font-mono">{row.codigo}</td>
        <td className="px-3 py-2 border-b">{row.description}</td>
        <td className="px-3 py-2 border-b text-right">{row.disponible}</td>
        <td className="px-3 py-2 border-b text-right">{row.minimo}</td>
        <td className="px-3 py-2 border-b text-right">{row.reorder}</td>
        <td className="px-3 py-2 border-b text-right font-semibold">{row.dias_disponibles}</td>
        <td className="px-3 py-2 border-b text-center">{formatDate(row.date_upload)}</td>
      </tr>
    );
  }

  // --- Caso para la tabla General ---
  if (type === "general") {
    return (
      <tr className="hover:bg-gray-50">
        <td className="px-3 py-2 border-b">{row.fecha}</td>
        <td className="px-3 py-2 border-b">{row.codigo}</td>
        <td className="px-3 py-2 border-b">{row.descripcion}</td>
        <td className="px-3 py-2 border-b">{row.lote}</td>
        <td className="px-3 py-2 border-b">{row.tipo}</td>
        <td className="px-3 py-2 border-b">{row.actividad}</td>
        <td className="px-3 py-2 border-b text-right">{row.productividad}</td>
        <td className="px-3 py-2 border-b text-right">{row.cantidad}</td>
        <td className="px-3 py-2 border-b text-right">{row.minutos}</td>
        <td className="px-3 py-2 border-b text-right">{row.personas}</td>
        <td className="px-3 py-2 border-b text-right">{row.totalHoras}</td>
      </tr>
    );
  }

  // --- Caso para la tabla de Resumen ---
  if (type === "resumen") {
    return (
      <tr className="hover:bg-gray-50 text-sm">
        <td className="px-3 py-2 border-b">{row.codigo}</td>
        <td className="px-3 py-2 border-b">{row.descripcion}</td>
        <td className="px-3 py-2 border-b">{row.tipo}</td>
        <td className="px-3 py-2 border-b text-right">{row.sumaTotalHoras}</td>
        <td className="px-3 py-2 border-b text-right">{row.sumCantidad}</td>
        <td className="px-3 py-2 border-b text-right">{row.promTiempoProducto}</td>
        <td className="px-3 py-2 border-b text-right">{row.numeroPersonas}</td>
        <td className="px-3 py-2 border-b text-right">{row.totalTiempoReal}</td>
      </tr>
    );
  }

  // --- Caso para la tabla de Operarios ---
  if (type === "operators") {
    const completionRate = row.completion_rate || 0;
    const rateColor = completionRate >= 85 ? 'text-green-600' : completionRate >= 60 ? 'text-yellow-600' : 'text-red-600';
    const productivity = row.real_productivity;

    return (
      <tr className="hover:bg-gray-50 text-sm">
        <td className="px-3 py-2 border-b font-semibold">{row.operator_name || row.username || "-"}</td>
        <td className="px-3 py-2 border-b">{row.job_title || "-"}</td>
        <td className="px-3 py-2 border-b">{row.teams || "-"}</td>
        <td className="px-3 py-2 border-b text-right">{row.active_days || 0}</td>
        <td className="px-3 py-2 border-b text-right">{row.completed_tasks || 0}</td>
        <td className="px-3 py-2 border-b text-right">{row.total_real_quantity || 0}</td>
        <td className="px-3 py-2 border-b text-right font-mono">{row.total_real_minutes || 0}</td>
        <td className={`px-3 py-2 border-b text-right font-bold ${rateColor}`}>
          {completionRate.toFixed(1)}%
        </td>
        <td className="px-3 py-2 border-b text-right font-mono">
          {productivity != null ? productivity.toFixed(2) : "-"}
        </td>
      </tr>
    );
  }

  // --- Caso para la tabla de Rendimiento ---
  const rend = row.rendimiento;
  const rendColor = rend !== null && rend !== undefined
    ? (rend >= 85 ? 'text-green-600' : rend >= 60 ? 'text-yellow-600' : 'text-red-600')
    : 'text-gray-400';
  const formatTime = (val: string | null) => {
    if (!val) return "-";
    if (val.includes("T")) return val.slice(11, 19);
    if (val.length >= 8) return val.slice(0, 8);
    return val;
  };

  return (
    <tr className="hover:bg-gray-50 text-sm">
      <td className="px-3 py-2 border-b font-semibold">{row.equipo || "-"}</td>
      <td className="px-3 py-2 border-b">{row.codigo || "-"}</td>
      <td className="px-3 py-2 border-b">{row.description || "-"}</td>
      <td className="px-3 py-2 border-b">{row.material || "-"}</td>
      <td className="px-3 py-2 border-b">{row.lote || "-"}</td>
      <td className="px-3 py-2 border-b text-right">{row.cantidad_planificada ?? "-"}</td>
      <td className="px-3 py-2 border-b text-right">{row.cantidad_real ?? "-"}</td>
      <td className="px-3 py-2 border-b text-center">{formatTime(row.inicio_planificado)}</td>
      <td className="px-3 py-2 border-b text-center">{formatTime(row.final_planificado)}</td>
      <td className="px-3 py-2 border-b text-right font-mono">{row.tiempo_planificado ?? "-"}</td>
      <td className="px-3 py-2 border-b text-center">{formatTime(row.inicio_real)}</td>
      <td className="px-3 py-2 border-b text-center">{formatTime(row.final_real)}</td>
      <td className="px-3 py-2 border-b text-right font-mono">{row.tiempo_real != null ? row.tiempo_real.toFixed(2) : "-"}</td>
      <td className={`px-3 py-2 border-b text-right font-bold ${rendColor}`}>
        {rend != null ? `${rend.toFixed(2)}%` : "N/A"}
      </td>
      <td className="px-3 py-2 border-b text-xs max-w-[150px] truncate" title={row.comentarios || ""}>
        {row.comentarios || "-"}
      </td>
    </tr>
  );
};

export default TableRow;

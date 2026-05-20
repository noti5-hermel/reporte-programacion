// src/components/Table/TableRow.tsx
import React from "react";

interface RowProps {
  type: "general" | "resumen" | "disponibilidad" | "rendimiento";
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

  // --- Caso para la tabla de Rendimiento ---
  const isCompleted = row.is_completed || row.estado === 'Completada' || (row.real_quantity && row.real_quantity > 0);
  const prodValue = parseFloat(String(row.productividad || 0).replace('%', ''));
  const prodColor = prodValue >= 85 ? 'text-green-600' : prodValue >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <tr className="hover:bg-gray-50 text-sm">
      <td className="px-3 py-2 border-b font-semibold">{row.team_name || row.equipo || "-"}</td>
      <td className="px-3 py-2 border-b">{row.codigo || row.code || "-"}</td>
      <td className="px-3 py-2 border-b">{row.descripcion || row.description || "-"}</td>
      <td className="px-3 py-2 border-b">{row.material || "-"}</td>
      <td className="px-3 py-2 border-b">{row.lote || "-"}</td>
      <td className="px-3 py-2 border-b text-right">{row.quantity || row.scheduled_quantity || 0}</td>
      <td className="px-3 py-2 border-b text-right">{row.real_quantity || 0}</td>
      <td className="px-3 py-2 border-b text-center">{row.real_start_time || "-"}</td>
      <td className="px-3 py-2 border-b text-center">{row.real_end_time || "-"}</td>
      <td className="px-3 py-2 border-b text-right font-mono">{row.real_minutes || row.minutos || "-"}</td>
      <td className={`px-3 py-2 border-b text-right font-bold ${prodColor}`}>
        {row.productividad ? (typeof row.productividad === 'number' ? `${row.productividad.toFixed(2)}%` : row.productividad) : "0.00%"}
      </td>
      <td className="px-3 py-2 border-b text-center">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isCompleted ? 'Completada' : 'Pendiente'}
        </span>
      </td>
    </tr>
  );
};

export default TableRow;

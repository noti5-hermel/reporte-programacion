// src/components/Table/TableRow.tsx
import React from "react";

interface RowProps {
  type: "general" | "resumen" | "disponibilidad";
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
        <td className="px-3 py-2 border-b text-right">{row.horas}</td>
        <td className="px-3 py-2 border-b text-right">{row.cantidad}</td>
        <td className="px-3 py-2 border-b text-right">{row.minutos}</td>
        <td className="px-3 py-2 border-b text-right">{row.personas}</td>
        <td className="px-3 py-2 border-b text-right">{row.totalHoras}</td>
        <td className="px-3 py-2 border-b text-right">{row.promedio}</td>
      </tr>
    );
  }

  // --- Caso para la tabla de Resumen (default) ---
  return (
    <tr className="hover:bg-gray-50">
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
};

export default TableRow;

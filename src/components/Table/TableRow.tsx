// src/components/Table/TableRow.tsx
import React from "react";

interface RowProps {
  type: "general" | "resumen";
  row: any;
}

const TableRow: React.FC<RowProps> = ({ type, row }) => {
  if (type === "general") {
    return (
      <tr className="hover:bg-gray-100 transition-colors">
        <td className="px-4 py-3 border-b border-gray-200">{row.fecha}</td>
        <td className="px-4 py-3 border-b border-gray-200 font-mono">{row.codigo}</td>
        <td className="px-4 py-3 border-b border-gray-200">{row.descripcion}</td>
        <td className="px-4 py-3 border-b border-gray-200">{row.lote}</td>
        <td className="px-4 py-3 border-b border-gray-200">{row.tipo}</td>
        <td className="px-4 py-3 border-b border-gray-200">{row.actividad}</td>
        <td className="px-4 py-3 border-b border-gray-200 text-right">{row.horas}</td>
        <td className="px-4 py-3 border-b border-gray-200 text-right">{row.cantidad}</td>
        <td className="px-4 py-3 border-b border-gray-200 text-right">{row.minutos}</td>
        <td className="px-4 py-3 border-b border-gray-200 text-right">{row.personas}</td>
        <td className="px-4 py-3 border-b border-gray-200 text-right font-semibold">{row.totalHoras}</td>
        <td className="px-4 py-3 border-b border-gray-200 text-right">{row.promedio}</td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-100 transition-colors">
      <td className="px-4 py-3 border-b border-gray-200 font-mono">{row.codigo}</td>
      <td className="px-4 py-3 border-b border-gray-200">{row.descripcion}</td>
      <td className="px-4 py-3 border-b border-gray-200">{row.tipo}</td>
      <td className="px-4 py-3 border-b border-gray-200 text-right font-semibold">{row.sumaTotalHoras}</td>
      <td className="px-4 py-3 border-b border-gray-200 text-right">{row.sumCantidad}</td>
      <td className="px-4 py-3 border-b border-gray-200 text-right">{row.promTiempoProducto}</td>
      <td className="px-4 py-3 border-b border-gray-200 text-right">{row.numeroPersonas}</td>
    </tr>
  );
};

export default TableRow;

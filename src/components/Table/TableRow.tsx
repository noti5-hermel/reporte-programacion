// src/components/Table/TableRow.tsx
import React from "react";

interface RowProps {
  type: "general" | "resumen";
  row: any;
}

const TableRow: React.FC<RowProps> = ({ type, row }) => {
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

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-2 border-b">{row.codigo}</td>
      <td className="px-3 py-2 border-b">{row.descripcion}</td>
      <td className="px-3 py-2 border-b">{row.tipo}</td>
      <td className="px-3 py-2 border-b text-right">{row.sumaTotalHoras}</td>
      <td className="px-3 py-2 border-b text-right">{row.sumCantidad}</td>
      <td className="px-3 py-2 border-b text-right">{row.promTiempoProducto}</td>
      <td className="px-3 py-2 border-b text-right">{row.numeroPersonas}</td>
    </tr>
  );
};

export default TableRow;
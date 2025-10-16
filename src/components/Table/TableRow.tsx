import React from "react";

interface RowProps {
  type: "general" | "resumen";
  row: any;
}

const TableRow: React.FC<RowProps> = ({ type, row }) => {
  const commonClasses = "py-3 px-6 text-left whitespace-nowrap";
  const rowClasses = "border-b border-gray-200 hover:bg-gray-100";

  if (type === "general") {
    return (
      <tr className={rowClasses}>
        <td className={commonClasses}>{row.fecha}</td>
        <td className={`${commonClasses} font-mono`}>{row.codigo}</td>
        <td className={commonClasses}>{row.descripcion}</td>
        <td className={commonClasses}>{row.lote}</td>
        <td className={commonClasses}>{row.tipo}</td>
        <td className={commonClasses}>{row.actividad}</td>
        <td className={`${commonClasses} text-right`}>{row.horas}</td>
        <td className={`${commonClasses} text-right`}>{row.cantidad}</td>
        <td className={`${commonClasses} text-right`}>{row.minutos}</td>
        <td className={`${commonClasses} text-right`}>{row.personas}</td>
        <td className={`${commonClasses} text-right font-semibold`}>
          {row.totalHoras}
        </td>
        <td className={`${commonClasses} text-right`}>{row.promedio}</td>
      </tr>
    );
  }

  return (
    <tr className={rowClasses}>
      <td className={`${commonClasses} font-mono`}>{row.codigo}</td>
      <td className={commonClasses}>{row.descripcion}</td>
      <td className={commonClasses}>{row.tipo}</td>
      <td className={`${commonClasses} text-right font-semibold`}>
        {row.sumaTotalHoras}
      </td>
      <td className={`${commonClasses} text-right`}>{row.sumCantidad}</td>
      <td className={`${commonClasses} text-right`}>
        {row.promTiempoProducto}
      </td>
      <td className={`${commonClasses} text-right`}>{row.numeroPersonas}</td>
    </tr>
  );
};

export default TableRow;

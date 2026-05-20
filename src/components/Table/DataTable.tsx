// src/components/Table/DataTable.tsx
import React, { useState, useMemo } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

interface DataItem {
  [key: string]: any;
}

interface DataTableProps {
  type: "general" | "resumen" | "disponibilidad" | "rendimiento";
  data?: DataItem[];
  loading?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ type, data = [], loading }) => {
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(30);

  // 🔹 Definir columnas basadas en el tipo de tabla
  const columns = useMemo(() => {
    switch (type) {
      case "disponibilidad":
        return [
          "Código",
          "Descripción",
          "Disponible",
          "Mínimo",
          "Reorden",
          "Días Disponibles",
          "Fecha de Carga",
        ];
      case "general":
        return [
          "Fecha", "Código", "Descripción", "Lote", "Tipo", "Actividad",
          "Productividad", "Cantidad", "Minutos(horas)", "Personas", "Total Horas",
        ];
      case "rendimiento":
        return [
          "Equipo", "Código", "Descripción", "Material", "Lote", "Cant. Plan.", "Cant. Real", "H. Inicio", "H. Fin", "T. Real", "Productividad", "Estado"
        ];
      case "resumen":
      default:
        return [
          "Código", "Descripción", "Tipo", "Suma Total Horas",
          "Cantidad producida", "Prom. Tiempo Producto", "N° Personas",
          "Total Tiempo Real",
        ];
    }
  }, [type]);

  // 🔹 Función para manejar el ordenamiento
  const handleSort = (column: string) => {
    const normalizedColumn = column.toLowerCase().replace(/\s+/g, "");
    if (sortColumn === normalizedColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(normalizedColumn);
      setSortDirection("asc");
    }
  };

  // 🔹 Ordenar los datos
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortColumn] ?? "";
      const valB = b[sortColumn] ?? "";
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      return sortDirection === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [data, sortColumn, sortDirection]);

  // 🔹 Paginación
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (loading) {
    return <p className="text-center text-gray-500">Cargando datos...</p>;
  }

  if (data.length === 0) {
    return <p className="text-center text-gray-400">No hay datos disponibles</p>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full border-collapse">
          <TableHeader
            columns={columns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <tbody>
            {paginatedData.map((row, index) => (
              <TableRow key={index} type={type} row={row} />
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 Controles de paginación */}
      <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <span>Filas por página:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded-md p-1"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded disabled:opacity-40"
          >
            ◀
          </button>
          <span>
            Página {currentPage} de {totalPages || 1}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages || 1))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-2 py-1 border rounded disabled:opacity-40"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
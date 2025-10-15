// src/components/Table/DataTable.tsx
import React, { useState, useMemo } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

interface DataItem {
  [key: string]: any;
}

interface DataTableProps {
  type: "general" | "resumen";
  data?: DataItem[];
  loading?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ type, data = [], loading }) => {
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const columns =
    type === "general"
      ? [
          "Fecha",
          "Código",
          "Descripción",
          "Lote",
          "Tipo",
          "Actividad",
          "Horas",
          "Cantidad",
          "Minutos",
          "Personas",
          "Total Horas",
          "Promedio",
        ]
      : [
          "Código",
          "Descripción",
          "Tipo",
          "Suma Total Horas",
          "Suma Cantidad",
          "Prom. Tiempo Producto",
          "N° Personas",
        ];

  // 🔹 Función para manejar el ordenamiento
  const handleSort = (column: string) => {
    const normalizedColumn = column.toLowerCase().replace(/\s+/g, "");
    if (sortColumn === normalizedColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(normalizedColumn);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // 🔹 Ordenar los datos
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    const key = sortColumn;

    return [...data].sort((a, b) => {
      const valA = a[key] ?? "";
      const valB = b[key] ?? "";

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
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 text-lg">Cargando datos...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg">No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <div className="overflow-x-auto border rounded-xl">
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
          <label htmlFor="rows-per-page" className="font-medium">
            Filas por página:
          </label>
          <select
            id="rows-per-page"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page
            }}
            className="border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 transition"
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Anterior
          </button>
          <span className="font-medium">
            Página {currentPage} de {totalPages || 1}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages || 1))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;

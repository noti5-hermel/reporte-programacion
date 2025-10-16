import React, { useState, useMemo } from "react";
import { Frown } from "lucide-react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

const Spinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
  </div>
);

interface DataItem {
  [key: string]: any;
}

interface DataTableProps {
  type: "general" | "resumen";
  data?: DataItem[];
  loading?: boolean;
}

const keyMap: { [key: string]: string } = {
  fecha: "fecha",
  código: "codigo",
  descripción: "descripcion",
  lote: "lote",
  tipo: "tipo",
  actividad: "actividad",
  horas: "horas",
  cantidad: "cantidad",
  minutos: "minutos",
  personas: "personas",
  totalhoras: "totalHoras",
  promedio: "promedio",
  sumatotalhoras: "sumaTotalHoras",
  sumacantidad: "sumCantidad",
  "prom.tiempoproducto": "promTiempoProducto",
  "n°personas": "numeroPersonas",
};

const DataTable: React.FC<DataTableProps> = ({ type, data = [], loading }) => {
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const columns =
    type === "general"
      ? [
          "Fecha", "Código", "Descripción", "Lote", "Tipo", "Actividad",
          "Horas", "Cantidad", "Minutos", "Personas", "Total Horas", "Promedio",
        ]
      : [
          "Código", "Descripción", "Tipo", "Suma Total Horas",
          "Suma Cantidad", "Prom. Tiempo Producto", "N° Personas",
        ];

  const handleSort = (column: string) => {
    const normalizedColumn = column.toLowerCase().replace(/[\s.°]+/g, "");
    if (sortColumn === normalizedColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(normalizedColumn);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    const key = keyMap[sortColumn];
    if (!key) return data;

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

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <Spinner />
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-96 text-center bg-gray-50 rounded-lg">
          <Frown className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No hay datos para mostrar</h3>
          <p className="text-gray-500 mt-1">Intenta ajustar los filtros o vuelve más tarde.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full w-full">
          <TableHeader
            columns={columns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <tbody className="text-gray-600 text-sm font-light">
            {paginatedData.map((row, index) => (
              <TableRow key={index} type={type} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 md:p-6">{renderContent()}</div>
      {data.length > 0 && !loading && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-700 p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <label htmlFor="rows-per-page" className="font-medium">
              Filas por página:
            </label>
            <select
              id="rows-per-page"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-gray-50 border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="font-semibold">
              Página {currentPage} de {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages || 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

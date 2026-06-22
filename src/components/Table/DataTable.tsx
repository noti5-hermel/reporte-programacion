// src/components/Table/DataTable.tsx
import React, { useState, useMemo } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

interface DataItem {
  [key: string]: any;
}

interface DataTableProps {
  type: "general" | "resumen" | "disponibilidad" | "rendimiento" | "operators";
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
      case "operators":
        return [
          "Operario", "Cargo", "Equipos", "Días Activos", "Tareas Comp.", "Cant. Real", "T. Real (min)", "Eficiencia", "Prod. Real (und/h)"
        ];
      case "rendimiento":
        return [
          "Equipo", "Código", "Descripción", "Material", "Lote",
          "Cant. Plan.", "Cant. Real",
          "Inicio Planif.", "Final Planif.", "T. Planif.",
          "Inicio Real", "Final Real", "T. Real",
          "Rendimiento", "Comentarios"
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
    return <p className="text-center text-subtitle py-10">Cargando datos...</p>;
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-background-secondary border border-dashed border-border-card rounded-3xl">
        <p className="text-subtitle font-bold">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto bg-background-secondary border border-border-card rounded-2xl shadow-sm">
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
      <div className="flex flex-wrap justify-between items-center gap-4 text-sm font-bold text-subtitle">
        <div className="flex items-center gap-2">
          <span>Filas por página:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-border-card bg-background-primary rounded-xl p-1.5 text-title font-bold"
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
            className="px-3 py-1.5 border border-border-card bg-background-secondary rounded-xl font-bold text-sm disabled:opacity-40 hover:bg-background-primary transition-colors"
          >
            ◀
          </button>
          <span className="font-bold">
            Página {currentPage} de {totalPages || 1}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages || 1))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1.5 border border-border-card bg-background-secondary rounded-xl font-bold text-sm disabled:opacity-40 hover:bg-background-primary transition-colors"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
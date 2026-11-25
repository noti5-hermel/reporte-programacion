// src/components/Table/DataTable.tsx
import React, { useState, useMemo, useEffect } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import { COLUMN_DESCRIPTIONS } from "./ColumnHelp";
import type { SortDirection } from "../../hooks/useTableSort";

interface DataItem {
  [key: string]: any;
}

interface DataTableProps {
  type: "general" | "resumen" | "rendimiento" | "operators";
  data?: DataItem[];
  loading?: boolean;
  // Si el padre los pasa, el orden queda bajo su control y no se pierde al remontar.
  sortColumn?: string;
  sortDirection?: SortDirection;
  onSortChange?: (column: string, direction: SortDirection) => void;
}

const COLUMN_KEYS: Record<DataTableProps["type"], Record<string, string>> = {
  general: {
    Fecha: "fecha",
    Código: "codigo",
    Descripción: "descripcion",
    Tipo: "tipo",
    Lote: "lote",
    Actividad: "actividad",
    Producción: "produccion",
    Personas: "personas",
    "Cantidad Producida": "cantidad",
    Duración: "duracion",
    Horas: "horas",
    "Rendimiento Calculado": "rendimiento_calculado",
  },
  resumen: {
    Código: "codigo",
    Descripción: "descripcion",
    Tipo: "tipo",
    "Suma Total Horas": "sumaTotalHoras",
    "Cantidad producida": "sumCantidad",
    "Prom. Tiempo Producto": "promTiempoProducto",
    "N° Personas": "numeroPersonas",
    "Total Tiempo Real": "totalTiempoReal",
    "Rendimiento Calculado": "rendimiento_calculado",
    "Rendimiento Sistema": "rendimiento_sistema",
  },
  rendimiento: {
    Equipo: "equipo",
    Código: "codigo",
    Descripción: "description",
    Material: "material",
    Lote: "lote",
    "Cant. Plan.": "cantidad_planificada",
    "Cant. Real": "cantidad_real",
    "Inicio Planif.": "inicio_planificado",
    "Final Planif.": "final_planificado",
    "T. Planif.": "tiempo_planificado",
    "Inicio Real": "inicio_real",
    "Final Real": "final_real",
    "T. Real": "tiempo_real",
    Rendimiento: "rendimiento",
    Comentarios: "comentarios",
  },
  operators: {
    Operario: "operator_name",
    Cargo: "job_title",
    Equipos: "teams",
    "Días Activos": "active_days",
    "Tareas Comp.": "completed_tasks",
    "Cant. Real": "total_real_quantity",
    "T. Real (min)": "total_real_minutes",
    Eficiencia: "completion_rate",
    "Prod. Real (und/h)": "real_productivity",
  },
};

const DATE_KEYS = new Set([
  "fecha",
  "inicio_planificado",
  "final_planificado",
  "inicio_real",
  "final_real",
]);

function compareValues(valA: unknown, valB: unknown, key: string) {
  if (DATE_KEYS.has(key)) {
    const timeA = Date.parse(String(valA ?? ""));
    const timeB = Date.parse(String(valB ?? ""));
    return (Number.isNaN(timeA) ? -Infinity : timeA) - (Number.isNaN(timeB) ? -Infinity : timeB);
  }
  if (typeof valA === "number" && typeof valB === "number") {
    return valA - valB;
  }
  return String(valA ?? "").localeCompare(String(valB ?? ""));
}

const DataTable: React.FC<DataTableProps> = ({
  type,
  data = [],
  loading,
  sortColumn: controlledSortColumn,
  sortDirection: controlledSortDirection,
  onSortChange,
}) => {
  const [internalSortColumn, setInternalSortColumn] = useState<string>("");
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const isControlled = typeof onSortChange === "function";
  const activeSortColumn = isControlled ? (controlledSortColumn ?? "") : internalSortColumn;
  const activeSortDirection = isControlled ? (controlledSortDirection ?? "asc") : internalSortDirection;
  const columnKeys = COLUMN_KEYS[type];

  // 🔹 Definir columnas basadas en el tipo de tabla
  const columns = useMemo(() => {
    switch (type) {
      case "general":
        return [
          "Fecha", "Código", "Descripción", "Tipo", "Lote", "Actividad", "Producción",
          "Personas", "Cantidad Producida", "Duración", "Horas",
          "Rendimiento Calculado",
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
          "Total Tiempo Real", "Rendimiento Calculado", "Rendimiento Sistema",
        ];
    }
  }, [type]);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // 🔹 Función para manejar el ordenamiento
  const handleSort = (column: string) => {
    const key = columnKeys[column] ?? column.toLowerCase().replace(/\s+/g, "");
    const nextDirection: SortDirection =
      activeSortColumn === key && activeSortDirection === "asc" ? "desc" : "asc";

    if (isControlled) {
      onSortChange!(key, nextDirection);
    } else {
      setInternalSortColumn(key);
      setInternalSortDirection(nextDirection);
    }
    // Siempre mostrar la primera fila del nuevo orden (ej. la fecha más antigua).
    setCurrentPage(1);
  };

  // 🔹 Ordenar los datos
  const sortedData = useMemo(() => {
    if (!activeSortColumn) return data;
    return [...data].sort((a, b) => {
      const result = compareValues(a[activeSortColumn], b[activeSortColumn], activeSortColumn);
      return activeSortDirection === "asc" ? result : -result;
    });
  }, [data, activeSortColumn, activeSortDirection]);

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
            descriptions={COLUMN_DESCRIPTIONS[type]}
            sortColumn={activeSortColumn}
            sortDirection={activeSortDirection}
            onSort={handleSort}
            columnKeys={columnKeys}
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

// src/components/Table/TableHeader.tsx
import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { ColumnHelp } from "./ColumnHelp";
import type { SortDirection } from "../../hooks/useTableSort";

interface TableHeaderProps {
  columns: string[];
  descriptions?: Record<string, string>;
  sortColumn?: string;
  sortDirection?: SortDirection;
  onSort?: (column: string) => void;
  columnKeys?: Record<string, string>;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  descriptions,
  sortColumn,
  sortDirection,
  onSort,
  columnKeys,
}) => {
  return (
    <thead className="bg-background-primary text-subtitle">
      <tr>
        {columns.map((col) => {
          const key = columnKeys?.[col] ?? col.toLowerCase().replace(/\s+/g, "");
          const isSorted = sortColumn === key;
          const isNumeric = key === "rendimiento_calculado";
          const alignClass = isNumeric ? "text-right justify-end" : "text-left";

          return (
            <th
              key={col}
              onClick={() => onSort && onSort(col)}
              className={`px-3 py-3 text-xs font-bold tracking-wider uppercase border-b border-border-card cursor-pointer select-none hover:bg-background-secondary transition-colors ${alignClass}`}
            >
              <div className={`flex items-center gap-1 ${isNumeric ? "justify-end" : ""}`}>
                {col}
                {descriptions?.[col] && (
                  <span onClick={(e) => e.stopPropagation()}>
                    <ColumnHelp description={descriptions[col]} />
                  </span>
                )}
                {isSorted &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="w-3 h-3 text-button-primary" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-button-primary" />
                  ))}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

export default TableHeader;

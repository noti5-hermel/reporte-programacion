// src/components/Table/TableHeader.tsx
import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface TableHeaderProps {
  columns: string[];
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  sortColumn,
  sortDirection,
  onSort,
}) => {
  return (
    <thead className="bg-background-primary text-subtitle">
      <tr>
        {columns.map((col) => {
          const normalized = col.toLowerCase().replace(/\s+/g, "");
          const isSorted = sortColumn === normalized;

          return (
            <th
              key={col}
              onClick={() => onSort && onSort(col)}
              className="px-3 py-3 text-left text-xs font-bold tracking-wider uppercase border-b border-border-card cursor-pointer select-none hover:bg-background-secondary transition-colors"
            >
              <div className="flex items-center gap-1">
                {col}
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
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
    <thead className="bg-gray-100 text-gray-700">
      <tr>
        {columns.map((col) => {
          const normalized = col.toLowerCase().replace(/\s+/g, "");
          const isSorted = sortColumn === normalized;

          return (
            <th
              key={col}
              onClick={() => onSort && onSort(col)}
              className="px-4 py-3 text-left text-sm font-semibold border-b-2 border-gray-200 cursor-pointer select-none hover:bg-gray-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                {col}
                {isSorted &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
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

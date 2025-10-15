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
              className="px-3 py-2 text-left text-sm font-semibold border-b cursor-pointer select-none hover:bg-gray-50"
            >
              <div className="flex items-center gap-1">
                {col}
                {isSorted &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
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

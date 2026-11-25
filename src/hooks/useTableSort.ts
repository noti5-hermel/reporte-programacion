import { useCallback, useState } from "react";

export type SortDirection = "asc" | "desc";

export interface TableSort {
  sortColumn: string;
  sortDirection: SortDirection;
  handleSortChange: (column: string, direction: SortDirection) => void;
}

/**
 * Mantiene el estado del ordenamiento fuera de DataTable.
 * Así sobrevive a desmontes por `loading`, cambios de filtros o remounts.
 */
export function useTableSort(): TableSort {
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSortChange = useCallback((column: string, direction: SortDirection) => {
    setSortColumn(column);
    setSortDirection(direction);
  }, []);

  return { sortColumn, sortDirection, handleSortChange };
}

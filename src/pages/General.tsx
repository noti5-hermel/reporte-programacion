import { useState, useEffect, useCallback, useRef } from "react";
import { DataTable } from "../components/Table";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { completedTasksService } from "../services/completedTasksService";
import { useReportPermissions } from "../hooks/useReportPermissions";
import { useTableSort, type SortDirection } from "../hooks/useTableSort";
import { ShieldOff } from "lucide-react";

export default function General() {
  const allowed = useReportPermissions();
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const { sortColumn, sortDirection, handleSortChange } = useTableSort();
  const requestIdRef = useRef(0);

  const fetchData = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError("");
    try {
      // El servidor aplica filtros, orden y paginación; solo llega la página visible.
      const result = await completedTasksService.getCompletedTasks(
        page,
        rowsPerPage,
        startDate || undefined,
        endDate || undefined,
        searchQuery || undefined,
        sortColumn || undefined,
        sortColumn ? sortDirection : undefined
      );
      // Ignorar respuestas de cargas anteriores (evita "reordenes" tardíos).
      if (requestId !== requestIdRef.current) return;
      setData(result.data);
      setTotal(result.total);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setError("Error fetching data");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [page, rowsPerPage, startDate, endDate, searchQuery, sortColumn, sortDirection]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (allowed === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-button-primary"></div>
      </div>
    );
  }

  if (!allowed.has("general")) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-16 h-16 rounded-full bg-background-secondary border border-border-card flex items-center justify-center">
          <ShieldOff className="w-8 h-8 text-subtitle" />
        </div>
        <h2 className="text-xl font-bold text-title">Sin acceso a este reporte</h2>
        <p className="text-sm text-subtitle text-center max-w-md">
          No tienes permisos para ver el reporte de la tabla general. Solicita al administrador que te brinde acceso.
        </p>
      </div>
    );
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setPage(1);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setPage(1);
  };

  const handleSort = (column: string, direction: SortDirection) => {
    handleSortChange(column, direction);
    setPage(1);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-background-secondary border border-border-card rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-2xl font-black tracking-tight text-title">Listado General</h1>
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          placeholder="Buscar código y lote (ej. T001 L-200)"
        />
      </div>

      <div className="bg-background-secondary border border-border-card rounded-2xl p-4 sm:p-5 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex flex-col">
          <label htmlFor="start-date" className="text-sm font-bold text-title mb-2">Fecha de inicio</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="px-3 py-2.5 bg-background-primary border border-border-card rounded-xl text-sm font-bold text-title focus:ring-2 focus:ring-button-primary/20 focus:border-button-primary outline-none transition-all"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="end-date" className="text-sm font-bold text-title mb-2">Fecha de fin</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="px-3 py-2.5 bg-background-primary border border-border-card rounded-xl text-sm font-bold text-title focus:ring-2 focus:ring-button-primary/20 focus:border-button-primary outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-button-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-bold text-sm">{error}</div>
      ) : (
        <DataTable
          type="general"
          data={data}
          serverSide
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSortChange={handleSort}
        />
      )}
    </div>
  );
}

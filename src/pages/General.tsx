import { useState, useMemo, useEffect, useCallback } from "react";
import { DataTable } from "../components/Table";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { completedTasksService } from "../services/completedTasksService";

const PAGE_SIZE = 50;

export default function General() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await completedTasksService.getCompletedTasks(
        page,
        PAGE_SIZE,
        startDate || undefined,
        endDate || undefined
      );
      setData(result.data);
      setTotalPages(result.total_pages);
      setTotal(result.total);
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  }, [page, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(q)
      )
    );
  }, [data, searchQuery]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setPage(1);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-background-secondary border border-border-card rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-2xl font-black tracking-tight text-title">Listado General</h1>
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
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
        <>
          <DataTable type="general" data={filteredData} />

          <div className="flex items-center justify-between bg-background-secondary border border-border-card rounded-2xl px-4 sm:px-6 py-3 shadow-sm">
            <span className="text-sm text-subtitle">
              Total: <span className="font-bold text-title">{total}</span> registros
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-xl text-sm font-bold border border-border-card bg-background-primary hover:bg-border-card disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm text-subtitle px-2">
                Página <span className="font-bold text-title">{page}</span> de{" "}
                <span className="font-bold text-title">{totalPages}</span>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-xl text-sm font-bold border border-border-card bg-background-primary hover:bg-border-card disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

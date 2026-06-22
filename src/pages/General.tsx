import { useState, useMemo, useEffect } from "react";
import { DataTable } from "../components/Table";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { taskPerformanceService } from "../services/taskPerformanceService";

export default function General() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await taskPerformanceService.getTaskPerformance();
        const transformed = Array.isArray(result)
          ? result.map((item: any) => ({
              ...item,
              productividad: item.productividad ?? item.horas ?? item.horas_unitarias ?? null,
              cantidad: item.cantidad ?? item.cantidad_real ?? null,
              // API change: prefer `minutes`; keep fallbacks for compatibility
              minutos: item.minutes ?? item.minutos ?? item.minutos_estimados ?? null,
              totalHoras: item.totalHoras ?? item.total_horas ?? null,
              personas: item.personas ?? null,
            }))
          : result;
        setData(transformed);
      } catch (err) {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    let filtered = data;

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (startDate) {
      filtered = filtered.filter(
        (item) => new Date(item.fecha) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (item) => new Date(item.fecha) <= new Date(endDate)
      );
    }

    return filtered;
  }, [data, searchQuery, startDate, endDate]);

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
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2.5 bg-background-primary border border-border-card rounded-xl text-sm font-bold text-title focus:ring-2 focus:ring-button-primary/20 focus:border-button-primary outline-none transition-all"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="end-date" className="text-sm font-bold text-title mb-2">Fecha de fin</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
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
        <DataTable type="general" data={filteredData} />
      )}
    </div>
  );
}

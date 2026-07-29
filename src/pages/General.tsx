import { useState, useEffect, useCallback } from "react";
import { DataTable } from "../components/Table";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { completedTasksService } from "../services/completedTasksService";
import { useReportPermissions } from "../hooks/useReportPermissions";
import { ShieldOff } from "lucide-react";

export default function General() {
  const allowed = useReportPermissions();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [fetchKey, setFetchKey] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await completedTasksService.getCompletedTasks(
        1,
        500,
        startDate || undefined,
        endDate || undefined,
        searchQuery || undefined
      );
      setData(result.data);
      setFetchKey(k => k + 1);
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, searchQuery]);

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

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
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
          <DataTable key={fetchKey} type="general" data={data} />
        </>
      )}
    </div>
  );
}

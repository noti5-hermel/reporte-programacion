import { useState, useMemo, useEffect } from "react";
import { DataTable } from "../components/Table";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { API_BASE_URL } from "../api/config";

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
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/v1/reports/task-performance`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          const transformed = Array.isArray(result)
            ? result.map((item: any) => ({
                ...item,
                horas: item.horas ?? item.horas_unitarias ?? null,
                cantidad: item.cantidad ?? item.cantidad_real ?? null,
                // API change: prefer `minutes`; keep fallbacks for compatibility
                minutos: item.minutes ?? item.minutos ?? item.minutos_estimados ?? null,
                totalHoras: item.totalHoras ?? item.total_horas ?? null,
                // API change: prefer `proporcion`; keep fallbacks
                promedio: item.proporcion ?? item.ratio_horas ?? item.promedio ?? null,
              }))
            : result;
          setData(transformed);
        } else {
          setError("Failed to fetch data");
        }
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
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Listado General</h1>
      </div>

      <div className="flex items-center gap-4">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="flex flex-col">
          <label htmlFor="start-date" className="text-sm font-medium text-gray-600">Fecha de inicio</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="end-date" className="text-sm font-medium text-gray-600">Fecha de fin</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <DataTable type="general" data={filteredData} />
      )}
    </div>
  );
}

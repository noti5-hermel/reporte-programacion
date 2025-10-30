import { useState, useMemo, useEffect } from "react";
import { DataTable } from "../components/Table";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { API_BASE_URL } from "../api/config";

export default function Resumen() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/v1/reports/task-performance-group`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          // Transform the API data to match the expected format
          const transformed = Array.isArray(result)
            ? result.map((item: any) => ({
                codigo: item.code,
                descripcion: item.description,
                tipo: item.type,
                sumaTotalHoras: item.sum_hours,
                sumCantidad: item.sum_quantity,
                promTiempoProducto: item.avg_time_per_product,
                numeroPersonas: item.people,
                totalTiempoReal: item.final_metric,
              }))
            : [];
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
    if (!searchQuery) {
      return data;
    }
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Resumen por Producto</h1>
      </div>
      <div className="flex items-center gap-4">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <DataTable type="resumen" data={filteredData} />
      )}
    </div>
  );
}

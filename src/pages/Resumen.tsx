import { useState, useMemo, useEffect } from "react";
import { DataTable } from "../components/Table";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { API_BASE_URL } from "../api/config";
import * as XLSX from "xlsx";

export default function Resumen() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | null>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        let url = `${API_BASE_URL}/api/v1/reports/task-performance-group`;
        const params = new URLSearchParams();
        if (selectedYear !== null) {
          params.append('year', selectedYear.toString());
        }
        if (selectedMonth !== null) {
          params.append('month', selectedMonth.toString());
        }
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        const response = await fetch(url, {
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
  }, [selectedYear, selectedMonth]);

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

  const handleClearFilters = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
  };

  const handleExport = () => {
    const dataToExport = filteredData.map(item => ({
      'Código': item.codigo,
      'Descripción': item.descripcion,
      'Tipo': item.tipo,
      'Número de Personas': item.numeroPersonas,
      'Total Tiempo Real': item.totalTiempoReal,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resumen");
    XLSX.writeFile(workbook, "Resumen.xlsx");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Resumen por Producto</h1>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          Exportar a Excel
        </button>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="flex flex-col">
          <label htmlFor="year-select" className="text-sm font-medium text-gray-600">Año</label>
          <select
            id="year-select"
            value={selectedYear || ""}
            onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="month-select" className="text-sm font-medium text-gray-600">Mes</label>
          <select
            id="month-select"
            value={selectedMonth || ""}
            onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((name, index) => (
              <option key={index + 1} value={index + 1}>{name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Limpiar Filtros
        </button>
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

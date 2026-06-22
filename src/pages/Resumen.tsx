import { useState, useMemo, useEffect } from "react";
import { DataTable } from "../components/Table";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { productivityService } from "../services/productivityService";
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
        const result = await productivityService.getTaskPerformanceGroup(selectedYear, selectedMonth);
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
    <div className="flex flex-col gap-6">
      <div className="bg-background-secondary border border-border-card rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-2xl font-black tracking-tight text-title">Resumen por Producto</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-button-primary hover:bg-button-primary-hover text-white font-bold px-6 py-2.5 rounded-xl shadow-btn-glow hover:shadow-btn-glow-hover transition-all duration-200"
        >
          Exportar a Excel
        </button>
      </div>
      <div className="bg-background-secondary border border-border-card rounded-2xl p-4 sm:p-5 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex-grow max-w-xs">
          <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        </div>
        <div className="flex flex-col">
          <label htmlFor="year-select" className="text-sm font-bold text-title mb-2">Año</label>
          <select
            id="year-select"
            value={selectedYear || ""}
            onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2.5 bg-background-primary border border-border-card rounded-xl text-sm font-bold text-title focus:ring-2 focus:ring-button-primary/20 focus:border-button-primary outline-none transition-all"
          >
            <option value="">Todos</option>
            {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="month-select" className="text-sm font-bold text-title mb-2">Mes</label>
          <select
            id="month-select"
            value={selectedMonth || ""}
            onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2.5 bg-background-primary border border-border-card rounded-xl text-sm font-bold text-title focus:ring-2 focus:ring-button-primary/20 focus:border-button-primary outline-none transition-all"
          >
            <option value="">Todos</option>
            {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((name, index) => (
              <option key={index + 1} value={index + 1}>{name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-2 px-4 py-2.5 bg-background-primary border border-border-card text-title font-bold rounded-xl hover:bg-background-secondary transition-all text-sm shadow-sm"
        >
          Limpiar Filtros
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-button-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-bold text-sm">{error}</div>
      ) : (
        <DataTable type="resumen" data={filteredData} />
      )}
    </div>
  );
}

import { useState, useMemo, useEffect, useRef } from "react";
import { DataTable } from "../components/Table";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { productivityService } from "../services/productivityService";
import { useReportPermissions } from "../hooks/useReportPermissions";
import { useTableSort } from "../hooks/useTableSort";
import { ShieldOff } from "lucide-react";
import * as XLSX from "xlsx";

export default function Resumen() {
  const allowed = useReportPermissions();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | null>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth() + 1);
  const [showDiff25, setShowDiff25] = useState(false);
  const { sortColumn, sortDirection, handleSortChange } = useTableSort();
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (allowed === null || !allowed.has("resumen")) return;
    const requestId = ++requestIdRef.current;
    const fetchData = async () => {
      try {
        const result = await productivityService.getTaskPerformanceGroup(selectedYear, selectedMonth);
        if (requestId !== requestIdRef.current) return;
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
              rendimiento_calculado: item.rendimiento_calculado,
              rendimiento_sistema: item.rendimiento_sistema,
            }))
          : [];
        const filtered = transformed.filter((item) => {
          const tipoOk = String(item.tipo ?? "").trim() !== "";
          const rendimientoOk =
            item.rendimiento_calculado !== null &&
            item.rendimiento_calculado !== undefined &&
            String(item.rendimiento_calculado).trim() !== "";
          const cantidadOk = Number(item.sumCantidad) !== 0;
          return tipoOk && rendimientoOk && cantidadOk;
        });
        setData(filtered);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setError("Error fetching data");
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth, allowed]);

  const filteredData = useMemo(() => {
    let result = data;

    if (showDiff25) {
      result = result.filter((item) => {
        const calc = Number(item.rendimiento_calculado);
        const sist = Number(item.rendimiento_sistema);
        if (!Number.isFinite(calc) || !Number.isFinite(sist) || sist === 0) return false;
        const diffPct = Math.abs((calc - sist) / sist) * 100;
        return diffPct >= 25;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(q)
        )
      );
    }

    return result;
  }, [data, searchQuery, showDiff25]);

  if (allowed === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-button-primary"></div>
      </div>
    );
  }

  if (!allowed.has("resumen")) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-16 h-16 rounded-full bg-background-secondary border border-border-card flex items-center justify-center">
          <ShieldOff className="w-8 h-8 text-subtitle" />
        </div>
        <h2 className="text-xl font-bold text-title">Sin acceso a este reporte</h2>
        <p className="text-sm text-subtitle text-center max-w-md">
          No tienes permisos para ver el reporte resumido. Solicita al administrador que te brinde acceso.
        </p>
      </div>
    );
  }

  const handleClearFilters = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setShowDiff25(false);
  };

  const handleExport = () => {
    const dataToExport = filteredData.map(item => ({
      'Código': item.codigo,
      'Descripción': item.descripcion,
      'Tipo': item.tipo,
      'Número de Personas': item.numeroPersonas,
      'Total Tiempo Real': item.totalTiempoReal,
      'Rendimiento Calculado': item.rendimiento_calculado,
      'Rendimiento Sistema': item.rendimiento_sistema,
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
        <label className="flex items-center gap-2 px-3 py-2.5 bg-background-primary border border-border-card rounded-xl text-sm font-bold text-title cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showDiff25}
            onChange={(e) => setShowDiff25(e.target.checked)}
            className="h-4 w-4 rounded border-border-card text-button-primary focus:ring-button-primary/20"
          />
          Diferencia ≥ 25% (calc. vs sistema)
        </label>
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
        <DataTable
          type="resumen"
          data={filteredData}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />
      )}
    </div>
  );
}

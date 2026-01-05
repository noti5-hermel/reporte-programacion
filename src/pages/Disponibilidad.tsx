import { useState, useEffect, useCallback, useMemo, ChangeEvent } from "react";
import { AgGridReact } from "ag-grid-react";
import * as XLSX from "xlsx";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
// Se eliminan importaciones problemáticas y se simplifican
import type { ColDef, CellValueChangedEvent, CellClassParams, ValueParserParams } from "ag-grid-community";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { API_BASE_URL } from "../api/config";
import ColorCellRenderer from "../components/ColorCellRenderer";
import ColorPickerEditor from "../components/ColorPickerEditor";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const DisponibilidadPage = () => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // --- LÓGICA DE CARGA DE DATOS ---
  const fetchData = useCallback(async () => {
    // ... (sin cambios)
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- LÓGICA DE IMPORTACIÓN ---
  const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
    // ... (sin cambios)
  };

  // --- DEFINICIÓN DE COLUMNAS (CORREGIDA) ---
  const columnDefs: ColDef[] = [
    { headerName: "Código", field: "codigo", pinned: "left", editable: false, filter: true },
    { headerName: "Descripción", field: "description", filter: true, editable: false },
    { headerName: "Color", field: "color", editable: true, width: 150, cellRenderer: ColorCellRenderer, cellEditor: ColorPickerEditor },
    {
      headerName: "Disponible",
      field: "disponible",
      editable: true,
      filter: "agNumberColumnFilter",
      valueParser: p => Number(p.newValue) || 0,
      cellClassRules: { "bg-red-100 text-red-700 font-semibold": (p: CellClassParams) => p.value <= p.data.minimo }
    },
    { headerName: "Mínimo", field: "minimo", editable: true, filter: "agNumberColumnFilter", valueParser: p => Number(p.newValue) || 0 },
    { headerName: "Reorder", field: "reorder", editable: true, filter: "agNumberColumnFilter", valueParser: p => Number(p.newValue) || 0 },
    {
      headerName: "Días Disponibles",
      field: "dias_disponibles",
      editable: false,
      filter: "agNumberColumnFilter",
      cellClassRules: {
        "text-red-600 font-bold": (p: CellClassParams) => p.value <= 30,
        "text-yellow-600 font-semibold": (p: CellClassParams) => p.value > 30 && p.value <= 60,
        "text-green-600": (p: CellClassParams) => p.value > 60,
      }
    },
    {
      headerName: "Estado",
      valueGetter: p => p.data.disponible <= p.data.minimo ? "CRÍTICO" : "OK",
      cellClassRules: {
        "text-red-600 font-bold": (p: CellClassParams) => p.value === "CRÍTICO",
        "text-green-600 font-semibold": (p: CellClassParams) => p.value === "OK",
      }
    },
  ];

  // --- LÓGICA DE EDICIÓN ---
  const onCellValueChanged = useCallback(async (event: CellValueChangedEvent) => {
    // ... (sin cambios)
  }, []);

  // --- DEFINICIONES POR DEFECTO (CORREGIDO) ---
  const defaultColDef: ColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    floatingFilter: true, // Se mueve floatingFilter aquí
  }), []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Reporte de Disponibilidad de Inventario</h1>
        <label className={`px-4 py-2 rounded-lg text-white font-semibold cursor-pointer ${isImporting ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {isImporting ? "Importando..." : "Importar Excel"}
          <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileImport} disabled={isImporting} />
        </label>
      </div>

      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {loading ? <p>Cargando datos...</p> : error ? <p className="text-red-500">{error}</p> : (
        <div className="ag-theme-quartz" style={{ height: 600 }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination
            paginationPageSize={20}
            quickFilterText={searchQuery}
            animateRows
            rowSelection="multiple"
            onCellValueChanged={onCellValueChanged}
            // Se elimina la prop getRowStyle problemática
          />
        </div>
      )}
    </div>
  );
};

export default DisponibilidadPage;

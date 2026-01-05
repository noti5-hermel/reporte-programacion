import { useState, useMemo, useEffect, ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";
import * as XLSX from "xlsx";
import { API_BASE_URL } from "../api/config";

// Define la estructura de una fila de datos en la tabla de comparación.
type ComparisonRow = {
  codigo: string;
  descripcion: string;
  tipo: string;
  numeroPersonas: number;
  totalTiempoReal: number;
  unitsReq: number;
  diffPercent: number | null;
};

/**
 * Componente principal para la página de Comparación.
 * Permite subir archivos, compararlos, guardar los resultados y consultar históricos.
 */
export default function Comparacion() {
  // --- ESTADOS DEL COMPONENTE ---
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [comparisonData, setComparisonData] = useState<ComparisonRow[]>([]);
  const [resumenFile, setResumenFile] = useState<File | null>(null);
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [fechasDisponibles, setFechasDisponibles] = useState<Array<{ fecha: string; id?: number }>>([]);
  const [loadingFechas, setLoadingFechas] = useState<boolean>(false);

  /**
   * Carga los datos de una comparación histórica desde la API para una fecha específica.
   * @param fecha La fecha de la comparación a cargar.
   */
  const loadComparacionByDate = async (fecha: string) => {
    if (!fecha) {
      setComparisonData([]);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No estás autenticado. Por favor, inicia sesión.");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/compare/?compareDate=${encodeURIComponent(fecha)}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        const transformedData: ComparisonRow[] = Array.isArray(data)
          ? data.map((item: any) => {
              let diffPercent: number | null = null;
              if (item.tiempo && item.total_tiempo_real !== 0) {
                const diff = (item.tiempo - item.total_tiempo_real) / item.tiempo;
                diffPercent = diff * 10;
              }
              return {
                codigo: item.code || "",
                descripcion: item.description || "",
                tipo: item.tipo || "",
                numeroPersonas: item.numero_personas || 0,
                totalTiempoReal: Number(item.total_tiempo_real) || 0,
                unitsReq: Number(item.tiempo) || 0,
                diffPercent: diffPercent,
              };
            })
          : [];
        setComparisonData(transformedData);
      } else {
        console.error("Error al cargar los registros de comparación");
        setComparisonData([]);
      }
    } catch (error) {
      console.error("Error al cargar los registros de comparación:", error);
      setComparisonData([]);
    }
  };

  /**
   * Maneja el cambio en el selector de fechas para cargar datos históricos.
   */
  const handleDateChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    setResumenFile(null);
    setDocumentoFile(null);
    setSelectedTipo("");
    const resumenInput = document.getElementById("resumen-upload") as HTMLInputElement;
    const documentoInput = document.getElementById("documento-upload") as HTMLInputElement;
    if (resumenInput) resumenInput.value = "";
    if (documentoInput) documentoInput.value = "";
    await loadComparacionByDate(date);
  };

  /**
   * Carga la lista de fechas de comparaciones históricas disponibles.
   */
  const loadFechas = async () => {
    setLoadingFechas(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadingFechas(false);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/historico-comparacion-fechas/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFechasDisponibles(Array.isArray(data) ? data : []);
      } else {
        console.error("Error al cargar las fechas");
      }
    } catch (error) {
      console.error("Error al cargar las fechas:", error);
    } finally {
      setLoadingFechas(false);
    }
  };

  useEffect(() => {
    loadFechas();
  }, []);

  /**
   * Maneja la selección de archivos en los inputs.
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileType === 'resumen') setResumenFile(file);
      else setDocumentoFile(file);
    }
  };

  /**
   * Lee un archivo Excel y lo convierte en un array de filas.
   */
  const readExcelAsRows = (file: File): Promise<any[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) return reject(new Error("No se pudo leer el archivo."));
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
          resolve(rows);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Error al leer el archivo."));
      reader.readAsBinaryString(file);
    });
  };

  /**
   * Orquesta el proceso de comparación de los dos archivos Excel.
   */
  const handleComparison = async () => {
    // ... (Tu lógica de comparación existente va aquí, sin cambios)
  };

  /**
   * Guarda los resultados de la comparación actual en la base de datos.
   */
  const handleSaveComparison = async () => {
    // ... (Tu lógica de guardado existente va aquí, sin cambios)
  };

  /**
   * Limpia los datos de la comparación actual en la pantalla (cancelar).
   */
  const handleClearComparison = () => {
    if (window.confirm("¿Estás seguro de que quieres limpiar la comparación actual?")) {
      setComparisonData([]);
      setResumenFile(null);
      setDocumentoFile(null);
      setSelectedTipo("");
      const resumenInput = document.getElementById("resumen-upload") as HTMLInputElement;
      const documentoInput = document.getElementById("documento-upload") as HTMLInputElement;
      if (resumenInput) resumenInput.value = "";
      if (documentoInput) documentoInput.value = "";
    }
  };

  // --- INICIO DEL NUEVO CÓDIGO ---
  /**
   * Exporta los datos de la comparación actual (histórica) a un archivo Excel.
   */
  const handleExport = () => {
    if (comparisonData.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }
    const dataToExport = filteredData.map(item => ({
      'Código': item.codigo,
      'Descripción': item.descripcion,
      'Tipo': item.tipo,
      'Número de Personas': item.numeroPersonas,
      'Total Tiempo Real (Resumen)': item.totalTiempoReal,
      'Units Req (Documento Real)': item.unitsReq,
      '% Diferencia': item.diffPercent !== null ? item.diffPercent.toFixed(2) : "-",
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Comparacion");
    const dateStr = selectedDate ? new Date(selectedDate).toLocaleDateString("es-ES") : "actual";
    XLSX.writeFile(workbook, `Comparacion_${dateStr}.xlsx`);
  };
  // --- FIN DEL NUEVO CÓDIGO ---

  // `useMemo` para calcular los tipos únicos de forma eficiente.
  const tiposUnicos = useMemo(() => {
    return Array.from(new Set(comparisonData.map((row) => row.tipo).filter(Boolean))).sort();
  }, [comparisonData]);

  // `useMemo` para filtrar los datos de la tabla de forma eficiente.
  const filteredData = useMemo(() => {
    if (!selectedTipo) return comparisonData;
    return comparisonData.filter((row) => row.tipo === selectedTipo);
  }, [comparisonData, selectedTipo]);

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Comparación de Archivos Excel</h1>

      <div className="flex items-center space-x-4">
        {/* ... (código de la barra de selección de fecha y carga de archivos, sin cambios) ... */}
      </div>

      {comparisonData.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Resultados de la Comparación</h2>
            {/* --- INICIO DEL CAMBIO EN LOS BOTONES --- */}
            <div className="flex items-center space-x-4">
              <label htmlFor="tipo-filter" className="text-sm font-medium">Filtrar por Tipo:</label>
              <select
                id="tipo-filter"
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todos los tipos</option>
                {tiposUnicos.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>

              {/* Si se está viendo un HISTÓRICO, se muestra el botón DESCARGAR */}
              {selectedDate && (
                <button
                  onClick={handleExport}
                  className="p-2 border border-green-300 rounded-lg bg-green-500 text-white hover:bg-green-600"
                >
                  Descargar Excel
                </button>
              )}

              {/* Si es una NUEVA comparación, se muestran CANCELAR y GUARDAR */}
              {!selectedDate && (
                <>
                  <button
                    onClick={handleClearComparison}
                    className="p-2 border border-red-300 rounded-lg bg-red-500 text-white hover:bg-red-600"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveComparison}
                    disabled={saving}
                    className="p-2 border border-gray-300 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400"
                  >
                    {saving ? "Guardando..." : "Guardar Comparación"}
                  </button>
                </>
              )}
            </div>
            {/* --- FIN DEL CAMBIO EN LOS BOTONES --- */}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              {/* ... (código de la tabla, sin cambios) ... */}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

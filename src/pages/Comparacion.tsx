import { useState, useMemo, useEffect } from "react";
import { UploadCloud } from "lucide-react";
import * as XLSX from "xlsx";
import { compareService } from "../services/compareService";

type ComparisonRow = {
  codigo: string;
  descripcion: string;
  tipo: string;
  numeroPersonas: number;
  totalTiempoReal: number;
  unitsReq: number;
  diffPercent: number | null;
};

export default function Comparacion() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [comparisonData, setComparisonData] = useState<ComparisonRow[]>([]);
  const [resumenFile, setResumenFile] = useState<File | null>(null);
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [fechasDisponibles, setFechasDisponibles] = useState<Array<{ fecha: string; id?: string }>>([]);
  const [loadingFechas, setLoadingFechas] = useState<boolean>(false);

  const loadComparacionByDate = async (fecha: string) => {
    if (!fecha) {
      setComparisonData([]);
      return;
    }
    try {
      const data = await compareService.getCompareRecords(fecha);
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
    } catch (error) {
      console.error("Error al cargar los registros de comparación:", error);
      setComparisonData([]);
    }
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
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

  const loadFechas = async () => {
    setLoadingFechas(true);
    try {
      const data = await compareService.getHistoricoFechas();
      setFechasDisponibles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar las fechas:", error);
    } finally {
      setLoadingFechas(false);
    }
  };

  useEffect(() => {
    loadFechas();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileType === 'resumen') setResumenFile(file);
      else setDocumentoFile(file);
    }
  };

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

  const handleComparison = async () => {
    if (!resumenFile || !documentoFile) {
      alert("Debes seleccionar ambos archivos (Resumen y Documento Real).");
      return;
    }
    try {
      const [resumenRows, documentoRows] = await Promise.all([
        readExcelAsRows(resumenFile),
        readExcelAsRows(documentoFile),
      ]);
      if (resumenRows.length < 2 || documentoRows.length < 2) {
        alert("Alguno de los archivos no tiene datos suficientes.");
        return;
      }
      const parseNumber = (value: any): number => {
        if (value === null || value === undefined || value === "") return 0;
        const str = String(value).trim().replace(/,/g, ".");
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
      };
      const resumenData = resumenRows.slice(1).filter((row) => row[0]);
      const documentoData = documentoRows.slice(2).filter((row) => row[0]);
      const unitsReqByCode: Record<string, number> = {};
      documentoData.forEach((row) => {
        const code = String(row[2] ?? "").trim();
        const unitsReqValue = row[1];
        const unitsReq = parseNumber(unitsReqValue);
        if (code && unitsReqByCode[code] === undefined) {
          unitsReqByCode[code] = unitsReq;
        }
      });
      const result: ComparisonRow[] = resumenData.map((row) => {
        const codigo = String(row[0]).trim();
        const descripcion = String(row[1] ?? "").trim();
        const tipo = String(row[2] ?? "").trim();
        const numeroPersonas = parseNumber(row[3]);
        const totalTiempoReal = parseNumber(row[4]);
        const unitsReq = unitsReqByCode[codigo] ?? 0;
        let diffPercent: number | null = null;
        if (unitsReq !== 0) {
          const diff = (unitsReq - totalTiempoReal) / unitsReq;
          diffPercent = diff * 10;
        }
        return {
          codigo,
          descripcion,
          tipo,
          numeroPersonas,
          totalTiempoReal,
          unitsReq,
          diffPercent,
        };
      }).filter((row) => row.totalTiempoReal !== 0);
      setComparisonData(result);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al procesar los archivos. Ver consola para más detalles.");
    }
  };

  const handleSaveComparison = async () => {
    if (comparisonData.length === 0) {
      alert("No hay datos para guardar. Realiza una comparación primero.");
      return;
    }
    setSaving(true);
    try {
      const compareDate = new Date().toISOString();
      const dataToSend = comparisonData.map((row) => ({
        codigo: row.codigo,
        descripcion: row.descripcion,
        tipo: row.tipo,
        numeroPersonas: row.numeroPersonas,
        totalTiempoReal: row.totalTiempoReal,
        unitsReq: row.unitsReq,
        diferencia: row.totalTiempoReal - row.unitsReq,
        compareDate: compareDate,
      }));
      await compareService.createCompareRecords(dataToSend);
      try {
        await compareService.createHistoricoFecha(compareDate);
      } catch (fechaError) {
        console.error("Error al guardar la fecha en el historico:", fechaError);
      }
      setResumenFile(null);
      setDocumentoFile(null);
      setComparisonData([]);
      setSelectedTipo("");
      const resumenInput = document.getElementById("resumen-upload") as HTMLInputElement;
      const documentoInput = document.getElementById("documento-upload") as HTMLInputElement;
      if (resumenInput) resumenInput.value = "";
      if (documentoInput) documentoInput.value = "";
      await loadFechas();
      alert("Comparación guardada exitosamente.");
    } catch (error: any) {
      console.error("Error al guardar la comparación:", error);
      alert(`Hubo un error al guardar la comparación: ${error.message || error}`);
    } finally {
      setSaving(false);
    }
  };

  const handleClearComparison = () => {
    if (window.confirm("¿Estás seguro de que quieres limpiar la comparación actual? Se perderán los datos no guardados.")) {
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

  const tiposUnicos = useMemo(() => {
    return Array.from(new Set(comparisonData.map((row) => row.tipo).filter(Boolean))).sort();
  }, [comparisonData]);

  const filteredData = useMemo(() => {
    if (!selectedTipo) return comparisonData;
    return comparisonData.filter((row) => row.tipo === selectedTipo);
  }, [comparisonData, selectedTipo]);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-background-secondary border border-border-card rounded-2xl p-4 sm:p-5 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-title">Comparación de Archivos Excel</h1>
      </div>
      
      <div className="bg-background-secondary border border-border-card rounded-2xl p-4 sm:p-5 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex flex-col">
          <label htmlFor="date-select" className="text-sm font-bold text-title mb-2">Selecciona una fecha:</label>
          <select
            id="date-select"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-3 py-2.5 bg-background-primary border border-border-card rounded-xl text-sm font-bold text-title focus:ring-2 focus:ring-button-primary/20 focus:border-button-primary outline-none transition-all"
            disabled={loadingFechas}
          >
            <option value="">--Selecciona una fecha--</option>
            {fechasDisponibles.map((item, index) => {
              const fecha = new Date(item.fecha);
              const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
              return (
                <option key={item.id || index} value={item.fecha}>
                  {fechaFormateada}
                </option>
              );
            })}
          </select>
        </div>
        <label htmlFor="resumen-upload" className="flex items-center gap-2 px-4 py-2.5 bg-background-primary border border-border-card rounded-xl text-sm font-bold text-title cursor-pointer hover:bg-background-secondary transition-all shadow-sm">
          <UploadCloud className="w-4 h-4" />
          {resumenFile ? resumenFile.name : "Importar Resumen"}
          <input id="resumen-upload" type="file" className="hidden" onChange={(e) => handleFileChange(e, 'resumen')} />
        </label>
        <label htmlFor="documento-upload" className="flex items-center gap-2 px-4 py-2.5 bg-background-primary border border-border-card rounded-xl text-sm font-bold text-title cursor-pointer hover:bg-background-secondary transition-all shadow-sm">
          <UploadCloud className="w-4 h-4" />
          {documentoFile ? documentoFile.name : "Importar Documento Real"}
          <input id="documento-upload" type="file" className="hidden" onChange={(e) => handleFileChange(e, 'documento')} />
        </label>
        {resumenFile && documentoFile && (
          <button onClick={handleComparison} className="flex items-center gap-2 bg-button-primary hover:bg-button-primary-hover text-white font-bold px-6 py-2.5 rounded-xl shadow-btn-glow hover:shadow-btn-glow-hover transition-all duration-200">
            Realizar Comparación
          </button>
        )}
      </div>

      {comparisonData.length > 0 && (
        <div className="bg-background-secondary border border-border-card rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="text-lg font-bold text-title">
              Resultados de la Comparación
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="tipo-filter" className="text-sm font-bold text-title">Filtrar por Tipo:</label>
              <select
                id="tipo-filter"
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="px-3 py-2.5 bg-background-primary border border-border-card rounded-xl text-sm font-bold text-title focus:ring-2 focus:ring-button-primary/20 focus:border-button-primary outline-none transition-all"
              >
                <option value="">Todos los tipos</option>
                {tiposUnicos.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>

              {selectedDate && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-button-primary hover:bg-button-primary-hover text-white font-bold px-4 py-2.5 rounded-xl shadow-btn-glow hover:shadow-btn-glow-hover transition-all duration-200 text-sm"
                >
                  Descargar Excel
                </button>
              )}

              {!selectedDate && (
                <>
                  <button
                    onClick={handleClearComparison}
                    className="flex items-center gap-2 px-4 py-2.5 bg-background-primary border border-border-card text-title font-bold rounded-xl hover:bg-background-secondary transition-all text-sm shadow-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveComparison}
                    disabled={saving}
                    className="flex items-center gap-2 bg-button-primary hover:bg-button-primary-hover disabled:bg-background-primary disabled:text-subtitle text-white font-bold px-4 py-2.5 rounded-xl shadow-btn-glow hover:shadow-btn-glow-hover transition-all duration-200 text-sm"
                  >
                    {saving ? "Guardando..." : "Guardar Comparación"}
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-background-secondary border border-border-card rounded-xl">
              <thead>
                <tr className="bg-background-primary text-subtitle text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 border-b border-border-card text-left font-bold">Código</th>
                  <th className="px-4 py-3 border-b border-border-card text-left font-bold">Descripción</th>
                  <th className="px-4 py-3 border-b border-border-card text-left font-bold">Tipo</th>
                  <th className="px-4 py-3 border-b border-border-card text-right font-bold">Número de Personas</th>
                  <th className="px-4 py-3 border-b border-border-card text-right font-bold">Total Tiempo Real (Resumen)</th>
                  <th className="px-4 py-3 border-b border-border-card text-right font-bold">Units Req (Documento Real)</th>
                  <th className="px-4 py-3 border-b border-border-card text-right font-bold">% Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => {
                  const isOverThreshold = row.diffPercent !== null && row.diffPercent > 25;
                  return (
                    <tr key={`${row.codigo}-${index}`} className="hover:bg-background-primary transition-colors">
                      <td className="px-4 py-2.5 border-b border-border-card">{row.codigo}</td>
                      <td className="px-4 py-2.5 border-b border-border-card">{row.descripcion}</td>
                      <td className="px-4 py-2.5 border-b border-border-card">{row.tipo}</td>
                      <td className="px-4 py-2.5 border-b border-border-card text-right">{row.numeroPersonas}</td>
                      <td className="px-4 py-2.5 border-b border-border-card text-right">{row.totalTiempoReal.toFixed(3)}</td>
                      <td className="px-4 py-2.5 border-b border-border-card text-right">{row.unitsReq.toFixed(3)}</td>
                      <td className={`px-4 py-2.5 border-b border-border-card text-right font-bold ${isOverThreshold ? "text-red-600" : ""}`}>
                        {row.diffPercent !== null ? `${row.diffPercent.toFixed(2)}%` : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

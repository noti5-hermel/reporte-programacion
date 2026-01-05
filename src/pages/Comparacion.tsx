import { useState, useMemo, useEffect, type ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";
import * as XLSX from "xlsx";
import { API_BASE_URL } from "../api/config";

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
  const [fechasDisponibles, setFechasDisponibles] = useState<Array<{ fecha: string; id?: number }>>([]);
  const [loadingFechas, setLoadingFechas] = useState<boolean>(false);

  const loadComparacionByDate = async (fecha: string) => {
    // ... (código existente)
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    // ... (código existente)
  };

  const loadFechas = async () => {
    // ... (código existente)
  };

  useEffect(() => {
    loadFechas();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    // ... (código existente)
  };

  const readExcelAsRows = (file: File): Promise<any[][]> => {
    // ... (código existente)
  };

  const handleComparison = async () => {
    // ... (código existente)
  };

  const handleSaveComparison = async () => {
    // ... (código existente)
  };

  const handleClearComparison = () => {
    // ... (código existente)
  };
  
  const handleExport = () => {
    // ... (código existente)
  };

  const tiposUnicos = useMemo(() => {
    return Array.from(new Set(comparisonData.map((row) => row.tipo).filter(Boolean))).sort();
  }, [comparisonData]);

  const filteredData = useMemo(() => {
    if (!selectedTipo) return comparisonData;
    return comparisonData.filter((row) => row.tipo === selectedTipo);
  }, [comparisonData, selectedTipo]);

  return (
    <div className="p-6 space-y-6">
      {/* ... (código JSX existente) ... */}
    </div>
  );
}

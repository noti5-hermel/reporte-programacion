import { useState, type ChangeEvent, type FC, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Select } from '../components/Select';
import { processManoDeObra } from './FormatoPage/processors/manoDeObraProcessor';
import { processDiasDisponibles } from './FormatoPage/processors/diasDisponiblesProcessor';
import { API_BASE_URL } from '../api/config';

const FormatoPage: FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('manoDeObra');

  const formatOptions = [
    { value: 'manoDeObra', label: 'Formato Mano de Obra (HTM)' },
    { value: 'resumen', label: 'Formato Resumen (HTM)' },
    { value: 'diasDisponibles', label: 'Actualizar y Descargar Días Disponibles (XLSX)' },
  ];

  const acceptedFileTypes = useMemo(() => {
    switch (selectedFormat) {
      case 'diasDisponibles':
        return '.xlsx, .xls';
      default:
        return '.htm, .html';
    }
  }, [selectedFormat]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) {
      alert('Por favor, selecciona un archivo primero.');
      return;
    }
    setProcessing(true);

    let successMessage = 'Reporte generado y descargado exitosamente.';

    try {
      let dataForExcel: (string | number)[][];
      let fileName = 'reporte.xlsx';

      switch (selectedFormat) {
        case 'manoDeObra':
        case 'resumen': {
          const htmlContent = await selectedFile.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, 'text/html');
          const allDivs = Array.from(doc.querySelectorAll('div'));
          const rowsMap: { [top: string]: { left: number; text: string }[] } = {};
          allDivs.forEach(div => {
              const top = div.style.top;
              if (!top) return;
              if (!rowsMap[top]) rowsMap[top] = [];
              rowsMap[top].push({ left: parseInt(div.style.left, 10), text: div.textContent || '' });
          });
          const sortedRowEntries = Object.entries(rowsMap).sort(([topA], [topB]) => parseInt(topA, 10) - parseInt(topB, 10));
          const sortedRows = sortedRowEntries.map(([, cells]) => {
              cells.sort((a, b) => a.left - b.left);
              return cells;
          });
          const headerRowIndex = sortedRows.findIndex(row => row.some(cell => cell.text.trim().startsWith('Componen')));
          if (headerRowIndex === -1) throw new Error('No se pudo encontrar la cabecera "Componen".');
          const tableRows = sortedRows.slice(headerRowIndex);
          
          if (selectedFormat === 'manoDeObra') {
            dataForExcel = processManoDeObra(tableRows);
            fileName = 'reporte_mano_de_obra.xlsx';
          } else {
            const summary: { [group: string]: number } = {};
            let currentMCode = '';
            for (const row of tableRows.slice(1)) {
              const code = row[0]?.text.trim();
              const description = row[1]?.text.trim();
              if (code && /^M\d+/.test(code) && description) {
                currentMCode = code;
                if (!summary[currentMCode]) summary[currentMCode] = 0;
              } else if (currentMCode) {
                summary[currentMCode]++;
              }
            }
            dataForExcel = [['Grupo (M)', 'Cantidad de Filas de Datos'], ...Object.entries(summary)];
            fileName = 'reporte_resumen.xlsx';
          }
          break;
        }

        case 'diasDisponibles': {
          const fileBuffer = await selectedFile.arrayBuffer();
          const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const excelRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
          
          dataForExcel = processDiasDisponibles(excelRows);
          fileName = 'reporte_dias_disponibles.xlsx';

          if (dataForExcel[0][0] === 'Error') {
            throw new Error(dataForExcel[1][0] as string);
          }
          
          const dataRows = dataForExcel.slice(1);
          const jsonData = dataRows.map(row => ({
            codigo: row[0], description: row[1], disponible: row[2],
            minimo: row[3], reorder: row[4], dias_disponibles: row[5],
            color: '#FFFFFF'
          }));

          const token = localStorage.getItem("token");
          if (!token) throw new Error("No estás autenticado.");

          const deleteResponse = await fetch(`${API_BASE_URL}/api/v1/available/`, {
            method: 'DELETE',
            headers: { "Authorization": `Bearer ${token}` },
          });
          if (!deleteResponse.ok) throw new Error("Fallo al borrar los datos antiguos.");

          const postResponse = await fetch(`${API_BASE_URL}/api/v1/available/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
            body: JSON.stringify(jsonData),
          });
          if (!postResponse.ok) {
            const errorData = await postResponse.json();
            throw new Error(`Fallo al insertar los nuevos datos: ${errorData.detail || "Error del servidor"}`);
          }

          successMessage = "¡Éxito! La base de datos ha sido actualizada y el reporte se está descargando.";
          break;
        }

        default:
          throw new Error(`Formato desconocido: ${selectedFormat}`);
      }

      // --- GENERACIÓN DEL EXCEL (COMÚN A TODOS LOS FORMATOS) ---
      const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
      XLSX.writeFile(workbook, fileName);

      alert(successMessage);
      
    } catch (error) {
      console.error('Error procesando el archivo:', error);
      alert(`Hubo un error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Procesar Archivos para Reportes</h1>
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <Select
          id="format-select"
          label="Selecciona el formato a generar"
          value={selectedFormat}
          onChange={(e) => {
            setSelectedFormat(e.target.value);
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if(fileInput) fileInput.value = "";
            setSelectedFile(null);
          }}
          options={formatOptions}
        />
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona el archivo ({acceptedFileTypes.toUpperCase()})
          </label>
          <input
            id="file-upload"
            key={selectedFormat}
            type="file"
            accept={acceptedFileTypes}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button
          onClick={handleProcessFile}
          disabled={!selectedFile || processing}
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {processing ? 'Procesando...' : 'Procesar Archivo'}
        </button>
      </div>
    </div>
  );
};

export default FormatoPage;

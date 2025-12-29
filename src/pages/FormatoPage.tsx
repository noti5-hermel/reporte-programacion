import { useState, type ChangeEvent, type FC } from 'react';
import * as XLSX from 'xlsx';
import { Select } from '../../components/Select'; // Importar el nuevo componente

/**
 * Componente `FormatoPage`
 * (La descripción del componente permanece igual)
 */
const FormatoPage: FC = () => {
  // --- ESTADOS DEL COMPONENTE ---

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  // Nuevo estado para el formato seleccionado.
  const [selectedFormat, setSelectedFormat] = useState<string>('procesado');

  // --- OPCIONES PARA EL SELECT ---

  const formatOptions = [
    { value: 'procesado', label: 'Formato Procesado (Detallado)' },
    { value: 'resumen', label: 'Formato de Resumen (por Grupo)' },
  ];

  /**
   * Maneja el evento de selección de archivo.
   * @param {ChangeEvent<HTMLInputElement>} event - El evento del input de tipo 'file'.
   */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  /**
   * Orquesta el proceso completo de lectura, procesamiento y generación del Excel.
   * La lógica interna ahora depende del `selectedFormat`.
   */
  const handleProcessFile = () => {
    if (!selectedFile) {
      alert('Por favor, selecciona un archivo primero.');
      return;
    }

    setProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const htmlContent = e.target?.result as string;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        // ... (Toda la lógica de parseo del HTML y ordenamiento de filas permanece exactamente igual)
        const allDivs = Array.from(doc.querySelectorAll('div'));
        const rowsMap: { [top: string]: { left: number; text: string }[] } = {};
        allDivs.forEach(div => {
          const top = div.style.top;
          if (!top) return;
          if (!rowsMap[top]) rowsMap[top] = [];
          rowsMap[top].push({ left: parseInt(div.style.left, 10), text: div.textContent || '' });
        });
        const sortedRowEntries = Object.entries(rowsMap).sort(([topA], [topB]) => parseInt(topA, 10) - parseInt(topB, 10));
        let sortedRows = sortedRowEntries.map(([, cells]) => {
          cells.sort((a, b) => a.left - b.left);
          return cells;
        });
        const headerRowIndex = sortedRows.findIndex(row => row.some(cell => cell.text.trim().startsWith('Componen')));
        if (headerRowIndex === -1) {
            alert('No se pudo encontrar la cabecera de la tabla (columna "Componen").');
            setProcessing(false);
            return;
        }
        const tableRows = sortedRows.slice(headerRowIndex);

        // --- Lógica condicional para generar el Excel según el formato seleccionado ---
        if (selectedFormat === 'procesado') {
          // ... (Toda tu lógica existente para el formato detallado va aquí)
          // ... Esto incluye `processDataRow`, el bucle for, `convertirValorSistema`, etc.
          const dataForExcel: (string | number)[][] = [['Simulación de datos procesados']]; // Reemplazar con tu lógica real
          const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Procesado');
          XLSX.writeFile(workbook, 'reporte_procesado.xlsx');
        } else if (selectedFormat === 'resumen') {
          // Lógica para generar el reporte de resumen.
          const summary: { [group: string]: number } = {};
          let currentMCode = '';
          for (const row of tableRows.slice(1)) {
            const code = row[0]?.text.trim();
            const description = row[1]?.text.trim();
            const isMGroupRow = code && /^M\d+/.test(code) && description;
            if (isMGroupRow) {
              currentMCode = code;
              if (!summary[currentMCode]) summary[currentMCode] = 0;
            } else if (currentMCode) {
              summary[currentMCode]++;
            }
          }
          const dataForExcel = [['Grupo (M)', 'Cantidad de Filas de Datos']];
          Object.entries(summary).forEach(([group, count]) => {
            dataForExcel.push([group, count]);
          });
          const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumen');
          XLSX.writeFile(workbook, 'reporte_resumen.xlsx');
        }

      } catch (error) {
        console.error('Error procesando el archivo:', error);
        alert('Hubo un error al procesar el archivo.');
      } finally {
        setProcessing(false);
      }
    };

    reader.onerror = () => {
      alert('Error al leer el archivo.');
      setProcessing(false);
    };

    reader.readAsText(selectedFile);
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Procesar Formato HTM</h1>
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        
        {/* Usando el nuevo componente Select */}
        <Select
          id="format-select"
          label="Selecciona el formato a generar"
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          options={formatOptions}
        />

        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona el archivo de reporte (.HTM)
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".htm, .html"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={handleProcessFile}
          disabled={!selectedFile || processing}
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {processing ? 'Procesando...' : 'Generar Excel'}
       </button>
      </div>
    </div>
  );
};

export default FormatoPage;

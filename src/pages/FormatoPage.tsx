import { useState, type ChangeEvent, type FC } from 'react';

import * as XLSX from 'xlsx';

const FormatoPage: FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

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

        const allDivs = Array.from(doc.querySelectorAll('div'));

        // Agrupar divs por su posición vertical (top) para formar filas
        const rows: { [top: string]: { left: number; text: string }[] } = {};
        allDivs.forEach(div => {
          const top = div.style.top;
          const left = parseInt(div.style.left, 10);
          const text = div.innerText.trim();

          if (top && !isNaN(left) && text) {
            if (!rows[top]) {
              rows[top] = [];
            }
            rows[top].push({ left, text });
          }
        });

        // Ordenar las filas por su posición 'top' y las celdas por su posición 'left'
        const sortedRowKeys = Object.keys(rows).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
        
        const dataForExcel = sortedRowKeys.map(key => {
          const row = rows[key];
          // Ordenar celdas dentro de la fila por su posición horizontal
          return row.sort((a, b) => a.left - b.left).map(cell => cell.text);
        });

        // Crear el archivo Excel
        const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');

        // Descargar el archivo
        XLSX.writeFile(workbook, 'reporte.xlsx');

      } catch (error) {
        console.error('Error procesando el archivo:', error);
        alert('Hubo un error al procesar el archivo. Revisa la consola para más detalles.');
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Procesar Formato HTM a Excel</h1>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <p className="mb-4">
          Sube el archivo <code>.HTM</code> para procesarlo y convertirlo en un archivo Excel con el formato requerido.
        </p>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".htm, .html"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          />
          <button
            onClick={handleProcessFile}
            disabled={!selectedFile || processing}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {processing ? 'Procesando...' : 'Procesar y Descargar Excel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormatoPage;

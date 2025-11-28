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

        const rowsMap: { [top: string]: { left: number; text: string }[] } = {};
        allDivs.forEach(div => {
          const top = div.style.top;
          if (!top) return;

          if (!rowsMap[top]) {
            rowsMap[top] = [];
          }
          rowsMap[top].push({
            left: parseInt(div.style.left, 10),
            text: div.textContent?.trim() || '',
          });
        });

        const sortedRowEntries = Object.entries(rowsMap).sort(([topA], [topB]) => {
          return parseInt(topA, 10) - parseInt(topB, 10);
        });

        let sortedRows = sortedRowEntries.map(([, cells]) => {
          cells.sort((a, b) => a.left - b.left);
          return cells;
        });

        const headerRowIndex = sortedRows.findIndex(row =>
          row.some(cell => cell.text.trim().startsWith('Componen'))
        );

        if (headerRowIndex === -1) {
          alert('No se pudo encontrar la cabecera de la tabla (columna "Componen").');
          setProcessing(false);
          return;
        }

        const tableRows = sortedRows.slice(headerRowIndex);
        const headerCells = tableRows[0];
        const headers = headerCells.map(cell => ({ text: cell.text, left: cell.left }));
        const dataForExcel: (string | number)[][] = [headers.map(h => h.text)];

        const specialDescriptions = new Map([
          ['M1', 'EMPAQUE MANUAL MAS MEZCLA'],
          ['M2', 'EMPAQUE MANUAL GRUPO'],
          ['M3', 'EMPAQUE BOLSA DE 50, 55 LB'],
          ['M4', 'EMPAQUE MAQUINA SEMI AUTOMATICA'],
          ['M5', 'EMPAQUE MAQUINA AUTOMATICA'],
          ['M7', 'PESADO Y/O FABRICADO'],
          ['M9', 'MOLIENDA POLVOS/HORNEO'],
          ['M10', 'MOLIENDA EN PASTA'],
          ['M11', 'MEZCLA MANUAL POLVO'],
          ['M12', 'MEZCLA EN MAQUINA/EMPAQUE 25 KG'],
          ['M13', 'MEZCLAS LIQUIDAS Y/O EMPAQUE'],
          ['M15', 'FABRICACION DE ADEREZOS, JALEAS']
        ]);

        const processDataRow = (rowData: { left: number; text: string }[], headers: { text: string; left: number }[]) => {
          const newRow = Array(headers.length).fill('');
          rowData.forEach(cell => {
            if (!cell.text) return;
            let closestHeaderIndex = -1;
            let minDiff = Infinity;
            headers.forEach((header, index) => {
              const diff = Math.abs(cell.left - header.left);
              if (diff < minDiff) {
                minDiff = diff;
                closestHeaderIndex = index;
              }
            });
            if (closestHeaderIndex !== -1) {
              newRow[closestHeaderIndex] = (newRow[closestHeaderIndex] ? newRow[closestHeaderIndex] + ' ' : '') + cell.text;
            }
          });
          return newRow;
        }
        
        for (const row of tableRows.slice(1)) {
          const code = row[0]?.text;
          const description = row[1]?.text;

          // Regla 1: Filas especiales (M-Codes). Esta tiene prioridad.
          if (code && description && specialDescriptions.has(code) && description.trim().startsWith(specialDescriptions.get(code)!)) {
            const specialExcelRow = Array(headers.length).fill('');
            specialExcelRow[0] = code;
            specialExcelRow[1] = description.trim();
            dataForExcel.push(specialExcelRow);

            const dataPart = row.slice(2);
            if (dataPart.length > 0) {
              const dataExcelRow = processDataRow(dataPart, headers);
              if (dataExcelRow.some(cell => cell !== '')) {
                dataForExcel.push(dataExcelRow);
              }
            }
            continue; 
          }

          // --- INICIO: NUEVA LÓGICA DE DIVISIÓN GENERAL ---
          // Regla 2: Para todas las demás filas, buscar si hay que dividir en la posición 250pt.
          const splitIndex = row.findIndex(cell => cell.left >= 250);

          // Si se encuentra un punto de división y hay contenido antes de él...
          if (splitIndex > 0) {
            const part1 = row.slice(0, splitIndex);
            const part2 = row.slice(splitIndex);

            // Procesar y añadir la primera parte
            const excelRow1 = processDataRow(part1, headers);
            if (excelRow1.some(cell => cell !== '')) {
              dataForExcel.push(excelRow1);
            }
            
            // Procesar y añadir la segunda parte en una nueva fila
            const excelRow2 = processDataRow(part2, headers);
            if (excelRow2.some(cell => cell !== '')) {
              dataForExcel.push(excelRow2);
            }
          } else {
            // Si no hay punto de división, procesar la fila completa normalmente.
            const normalRow = processDataRow(row, headers);
            if (normalRow.some(cell => cell !== '')) {
              dataForExcel.push(normalRow);
            }
          }
          // --- FIN: NUEVA LÓGICA DE DIVISIÓN GENERAL ---
        }

        const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
        XLSX.writeFile(workbook, 'reporte_procesado.xlsx');

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Procesar Formato HTM</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
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
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300"
        >
          {processing ? 'Procesando...' : 'Generar Excel'}
        </button>
      </div>
    </div>
  );
};

export default FormatoPage;

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
            text: div.textContent || '',
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
        const headers = headerCells.map(cell => ({ text: cell.text.trim(), left: cell.left }));
        const dataForExcel: (string | number)[][] = [headers.map(h => h.text)];

        const convertirValorSistema = (valorStr: string): string => {
          const valorTrimmed = valorStr.trim();
          if (valorTrimmed === '') return (0).toFixed(3);

          const num = parseFloat(valorTrimmed);
          if (isNaN(num)) return (0).toFixed(3);

          let result: number;
          if (Math.floor(num) > 0) {
            result = num;
          } else {
            const parts = valorTrimmed.split('.');
            const decimalPart = parts.length > 1 ? parts[1] : '';
            const decimalDigits = decimalPart.length;

            if (decimalDigits === 3) {
              result = num;
            } else if (decimalDigits === 2) {
              result = num / 10;
            } else if (decimalDigits === 1) {
              result = num / 100;
            } else {
              result = num;
            }
          }
          return result.toFixed(3);
        };

        const unitsReqIndex = headers.findIndex(h => h.text === 'Units Req.');

        const processDataRow = (rowData: { left: number; text: string }[], headers: { text: string; left: number }[]) => {
          const newRow: (string | number)[] = Array(headers.length).fill('');
          rowData.forEach(cell => {
            if (cell.text === null || cell.text === undefined) return;

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
              if (closestHeaderIndex === unitsReqIndex) {
                newRow[closestHeaderIndex] = convertirValorSistema(cell.text);
              } else {
                const existingText = newRow[closestHeaderIndex];
                const newText = cell.text.trim();
                newRow[closestHeaderIndex] = (existingText ? `${existingText} ` : '') + newText;
              }
            }
          });
          return newRow;
        };

        let currentMCode = '';

        for (const row of tableRows.slice(1)) {
          const code = row[0]?.text.trim();
          const description = row[1]?.text.trim();

          const isMGroupRow = code && /^M\d+/.test(code) && description;

          if (isMGroupRow) {
            currentMCode = code; // Actualizar el código del grupo actual
            // NO se agrega la fila de cabecera M. Solo se procesa el resto de la línea si tiene datos.
            const dataPart = row.slice(2);
            if (dataPart.length > 0) {
                const dataExcelRow = processDataRow(dataPart, headers);
                const isRowMeaningful = dataExcelRow.some((cell, index) => (index === unitsReqIndex ? cell !== '0.000' : cell !== ''));
                if (isRowMeaningful) {
                    dataExcelRow[0] = currentMCode;
                    dataForExcel.push(dataExcelRow);
                }
            }
            continue; // Ir a la siguiente línea del archivo
          }

          // Si no es una fila de grupo M, es una fila de datos normal
          const splitIndex = row.findIndex(cell => cell.left >= 250);
          
          if (splitIndex > 0) {
            const part1 = row.slice(0, splitIndex);
            const part2 = row.slice(splitIndex);

            const excelRow1 = processDataRow(part1, headers);
            if (excelRow1.some((c, i) => (i === unitsReqIndex ? c !== '0.000' : c !== ''))) {
              excelRow1[0] = currentMCode;
              dataForExcel.push(excelRow1);
            }
            
            const excelRow2 = processDataRow(part2, headers);
            if (excelRow2.some((c, i) => (i === unitsReqIndex ? c !== '0.000' : c !== ''))) {
              excelRow2[0] = currentMCode;
              dataForExcel.push(excelRow2);
            }
          } else {
            const normalRow = processDataRow(row, headers);
            if (normalRow.some((c, i) => (i === unitsReqIndex ? c !== '0.000' : c !== ''))) {
              normalRow[0] = currentMCode;
              dataForExcel.push(normalRow);
            }
          }
        }

        // Eliminar la columna de descripción del grupo (columna B)
        dataForExcel.forEach(row => row.splice(1, 1));

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

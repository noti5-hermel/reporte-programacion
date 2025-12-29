/**
 * @file manoDeObraProcessor.ts
 * @description Contiene la lógica para procesar el archivo HTM y generar el reporte detallado de "Mano de Obra".
 */

/**
 * Procesa las filas de una tabla extraída de un HTM para generar un reporte detallado.
 * 
 * @param {Array<Array<{left: number, text: string}>>} tableRows - Las filas de la tabla parseadas del archivo HTM.
 * @returns {Array<Array<string | number>>} Los datos listos para ser convertidos a una hoja de Excel.
 */
export const processManoDeObra = (tableRows: { left: number; text: string }[][]) => {
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
      if (decimalPart.length === 3) result = num;
      else if (decimalPart.length === 2) result = num / 10;
      else if (decimalPart.length === 1) result = num / 100;
      else result = num;
    }
    return result.toFixed(3);
  };

  const unitsReqIndex = headers.findIndex(h => h.text === 'Units Req.');

  const processDataRow = (rowData: { left: number; text: string }[]) => {
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
      currentMCode = code;
      const dataPart = row.slice(2);
      if (dataPart.length > 0) {
        const dataExcelRow = processDataRow(dataPart);
        if (dataExcelRow.some((cell, index) => (index === unitsReqIndex ? cell !== '0.000' : cell !== ''))) {
          dataExcelRow[0] = currentMCode;
          dataForExcel.push(dataExcelRow);
        }
      }
      continue;
    }

    const splitIndex = row.findIndex(cell => cell.left >= 250);
    if (splitIndex > 0) {
      const part1 = row.slice(0, splitIndex);
      const part2 = row.slice(splitIndex);
      const excelRow1 = processDataRow(part1);
      if (excelRow1.some((c, i) => (i === unitsReqIndex ? c !== '0.000' : c !== ''))) {
        excelRow1[0] = currentMCode;
        dataForExcel.push(excelRow1);
      }
      const excelRow2 = processDataRow(part2);
      if (excelRow2.some((c, i) => (i === unitsReqIndex ? c !== '0.000' : c !== ''))) {
        excelRow2[0] = currentMCode;
        dataForExcel.push(excelRow2);
      }
    } else {
      const normalRow = processDataRow(row);
      if (normalRow.some((c, i) => (i === unitsReqIndex ? c !== '0.000' : c !== ''))) {
        normalRow[0] = currentMCode;
        dataForExcel.push(normalRow);
      }
    }
  }

  dataForExcel.forEach(row => row.splice(1, 1));
  return dataForExcel;
};

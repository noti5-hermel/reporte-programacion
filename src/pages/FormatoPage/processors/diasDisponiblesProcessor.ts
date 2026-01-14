/**
 * @file diasDisponiblesProcessor.ts
 * @description Contiene la lógica para procesar un reporte de inventario de dos filas por producto
 * y transformarlo en un reporte consolidado de días disponibles.
 */

/**
 * Procesa un Excel de inventario, consolidando dos filas por producto en una sola y calculando los días disponibles.
 * 
 * @param {any[][]} excelRows - Las filas parseadas del archivo Excel de inventario.
 * @returns {Array<Array<string | number>>} Los datos consolidados listos para el nuevo reporte.
 */
export const processDiasDisponibles = (excelRows: any[][]): (string | number)[][] => {
  // 1. Iniciar la lectura desde la fila 2 (índice 1).
  const relevantRows = excelRows.slice(1);

  if (!relevantRows || relevantRows.length < 2) {
    return [['Error'], ['El archivo no contiene suficientes datos a partir de la segunda fila.']];
  }

  // 2. Buscar la cabecera usando "Description" como ancla.
  const headerRowIndex = relevantRows.findIndex(row => 
    row.some(cell => String(cell).trim() === "Description")
  );

  if (headerRowIndex === -1) {
    return [['Error'], ['No se encontró la cabecera "Description" a partir de la segunda fila.']];
  }

  const sourceHeader = relevantRows[headerRowIndex].map(cell => String(cell).trim());
  const dataRows = relevantRows.slice(headerRowIndex + 1);

  // 3. Encontrar los índices de las columnas necesarias.
  const descriptionIndex = sourceHeader.indexOf("Description");
  const availableIndex = sourceHeader.indexOf("Available");
  const minimumIndex = sourceHeader.indexOf("Minimum");
  const reorderIndex = sourceHeader.indexOf("Reorder");

  if ([descriptionIndex, availableIndex, minimumIndex, reorderIndex].includes(-1)) {
    return [['Error'], ['Faltan columnas requeridas: "Description", "Available", "Minimum", o "Reorder".']];
  }

  const processedData: (string | number)[][] = [];

  // 4. Procesar las filas en pares.
  for (let i = 0; i < dataRows.length; i += 2) {
    const mainRow = dataRows[i];
    const nameRow = dataRows[i + 1];

    if (!nameRow) continue;

    const codigo = mainRow[descriptionIndex] ? String(mainRow[descriptionIndex]).trim() : '';
    const descripcion = nameRow[descriptionIndex] ? String(nameRow[descriptionIndex]).trim() : '';
    
    // --- FILTRO PARA EXCLUIR REGISTROS INVÁLIDOS ---
    if (descripcion === "8:" || codigo === "Product Number") {
      continue; // Ignora este par de filas y salta a la siguiente iteración.
    }

    // --- ASEGURAR QUE LOS VALORES SEAN ENTEROS ---
    const disponible = mainRow[availableIndex] ? Math.round(Number(mainRow[availableIndex])) : 0;
    const minimo = mainRow[minimumIndex] ? Math.round(Number(mainRow[minimumIndex])) : 0;
    const reorder = mainRow[reorderIndex] ? Math.round(Number(mainRow[reorderIndex])) : 0;

    // --- Lógica de cálculo para Días Disponibles (siempre numérico) ---
    let diasDisponibles: number;
    if (minimo > 0) {
      const normalizedDesc = descripcion.trim().toUpperCase();
      if (normalizedDesc.endsWith('X')) {
        diasDisponibles = (disponible / minimo) * 15;
      } else {
        diasDisponibles = (disponible / minimo) * 30;
      }
      diasDisponibles = Math.round(diasDisponibles);
    } else {
      diasDisponibles = 0; // Usar 0 en lugar de "N/A"
    }
    
    if (codigo) {
      processedData.push([
        codigo,
        descripcion,
        disponible,
        minimo,
        reorder,
        diasDisponibles
      ]);
    }
  }

  // 5. Ordenar los datos procesados (lógica simplificada).
  processedData.sort((a, b) => {
    // Indices: 1 = DESCRIPCION, 5 = DIAS DISPONIBLES
    const descA = String(a[1]).toLowerCase();
    const descB = String(b[1]).toLowerCase();
    const diasA = Number(a[5]);
    const diasB = Number(b[5]);

    // Ordenamiento secundario (agrupación): por descripción alfabética.
    const descCompare = descA.localeCompare(descB);
    if (descCompare !== 0) {
      return descCompare;
    }

    // Ordenamiento primario: por días disponibles (menor a mayor).
    return diasA - diasB;
  });
  
  // 6. Devolver los datos con la cabecera del reporte final.
  const finalHeader = ['CODIGO', 'DESCRIPCION', 'DISPONIBLE', 'MINIMO', 'REORDER', 'DIAS DISPONIBLES'];
  
  if (processedData.length === 0) {
    return [finalHeader, ['No se encontraron datos de productos válidos para procesar.']];
  }

  return [finalHeader, ...processedData];
};

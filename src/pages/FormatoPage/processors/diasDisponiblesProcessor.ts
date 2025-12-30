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
  const reorderIndex = sourceHeader.indexOf("Reorder"); // Todavía se necesita para la fila de salida

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
    
    const disponible = mainRow[availableIndex] ? Number(mainRow[availableIndex]) : 0;
    const minimo = mainRow[minimumIndex] ? Number(mainRow[minimumIndex]) : 0;
    const reorder = mainRow[reorderIndex] ? Number(mainRow[reorderIndex]) : 0;

    // --- INICIO DE LA NUEVA LÓGICA DE CÁLCULO ---
    let diasDisponibles: number | string;
    if (minimo > 0) {
      // Normalizar la descripción para la verificación.
      const normalizedDesc = descripcion.trim().toUpperCase();
      
      if (normalizedDesc.endsWith('X')) {
        // Si termina en 'X', se multiplica por 15.
        diasDisponibles = (disponible / minimo) * 15;
      } else {
        // Si no, se multiplica por 30.
        diasDisponibles = (disponible / minimo) * 30;
      }
      // Redondear el resultado al entero más cercano.
      diasDisponibles = Math.round(diasDisponibles);
    } else {
      // Si el mínimo es 0, no se puede calcular.
      diasDisponibles = 'N/A';
    }
    // --- FIN DE LA NUEVA LÓGICA DE CÁLCULO ---
    
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

  // 5. Devolver los datos con la cabecera del reporte final.
  const finalHeader = ['CODIGO', 'DESCRIPCION', 'DISPONIBLE', 'MINIMO', 'REORDER', 'DIAS DISPONIBLES'];
  
  if (processedData.length === 0) {
    return [finalHeader, ['No se encontraron datos de productos válidos para procesar.']];
  }

  return [finalHeader, ...processedData];
};

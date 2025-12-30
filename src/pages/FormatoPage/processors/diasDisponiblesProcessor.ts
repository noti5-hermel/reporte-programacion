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
  if (!excelRows || excelRows.length < 3) {
    return [['Error'], ['El archivo de inventario no contiene datos suficientes.']];
  }

  // 1. Buscar inteligentemente la cabecera usando "Description" como ancla, según lo solicitado.
  const headerRowIndex = excelRows.findIndex(row => 
    row.some(cell => String(cell).trim() === "Description")
  );

  if (headerRowIndex === -1) {
    return [['Error'], ['No se encontró la cabecera "Description" en el archivo. Por favor, verifica el formato.']];
  }

  const sourceHeader = excelRows[headerRowIndex].map(cell => String(cell).trim());
  const dataRows = excelRows.slice(headerRowIndex + 1);

  // 2. Encontrar los índices de las columnas que necesitamos del archivo de origen.
  // Aunque buscamos por "Description", todavía necesitamos "Product Number" para el código.
  const productNumberIndex = sourceHeader.indexOf("Product Number");
  const availableIndex = sourceHeader.indexOf("Available");
  const minimumIndex = sourceHeader.indexOf("Minimum");
  const reorderIndex = sourceHeader.indexOf("Reorder");

  if ([productNumberIndex, availableIndex, minimumIndex, reorderIndex].includes(-1)) {
    return [['Error'], ['Faltan columnas requeridas en el archivo: "Product Number", "Description", "Available", "Minimum", o "Reorder".']];
  }

  const processedData: (string | number)[][] = [];

  // 3. Procesar las filas en pares
  for (let i = 0; i < dataRows.length; i += 2) {
    const mainRow = dataRows[i];
    const descriptionRow = dataRows[i + 1];

    if (!descriptionRow) continue;

    const codigo = mainRow[productNumberIndex] ? String(mainRow[productNumberIndex]).trim() : '';
    const descripcion = descriptionRow[0] ? String(descriptionRow[0]).trim() : '';
    
    const disponible = mainRow[availableIndex] ? Number(mainRow[availableIndex]) : 0;
    const minimo = mainRow[minimumIndex] ? Number(mainRow[minimumIndex]) : 0;
    const reorder = mainRow[reorderIndex] ? Number(mainRow[reorderIndex]) : 0;

    // 4. Calcular los días disponibles
    let diasDisponibles: number | string = 0;
    if (reorder > 0) {
      const consumoDiario = reorder / 30;
      diasDisponibles = consumoDiario > 0 ? Math.floor(disponible / consumoDiario) : 'Inf';
    } else {
      diasDisponibles = 'N/A';
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

  // 5. Devolver los datos con la nueva cabecera del reporte final
  const finalHeader = ['CODIGO', 'DESCRIPCION', 'DISPONIBLE', 'MINIMO', 'REORDER', 'DIAS DISPONIBLES'];
  
  if (processedData.length === 0) {
    return [finalHeader, ['No se encontraron datos de productos válidos.']];
  }

  return [finalHeader, ...processedData];
};

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

  // 1. Buscar inteligentemente la cabecera del archivo de entrada
  const headerRowIndex = excelRows.findIndex(row => 
    row.some(cell => String(cell).trim() === "Product Number")
  );

  if (headerRowIndex === -1) {
    return [['Error'], ['No se encontró la cabecera "Product Number" en el archivo.']];
  }

  const sourceHeader = excelRows[headerRowIndex].map(cell => String(cell).trim());
  const dataRows = excelRows.slice(headerRowIndex + 1);

  // 2. Encontrar los índices de las columnas que necesitamos del archivo de origen
  const productNumberIndex = sourceHeader.indexOf("Product Number");
  const availableIndex = sourceHeader.indexOf("Available");
  const minimumIndex = sourceHeader.indexOf("Minimum");
  const reorderIndex = sourceHeader.indexOf("Reorder");

  // La columna "Product Number" en la cabecera es la columna A en los datos, por lo que su índice es 0.
  // Sin embargo, para flexibilidad, lo buscamos dinámicamente.
  if ([productNumberIndex, availableIndex, minimumIndex, reorderIndex].includes(-1)) {
    return [['Error'], ['Faltan columnas requeridas en el archivo: "Product Number", "Available", "Minimum", o "Reorder".']];
  }

  const processedData: (string | number)[][] = [];

  // 3. Procesar las filas en pares (una para datos principales, otra para descripción)
  for (let i = 0; i < dataRows.length; i += 2) {
    const mainRow = dataRows[i];
    const descriptionRow = dataRows[i + 1];

    if (!descriptionRow) continue; // Si no hay una segunda fila para el par, se ignora.

    // El código es la columna A (índice `productNumberIndex`) de la primera fila.
    const codigo = mainRow[productNumberIndex] ? String(mainRow[productNumberIndex]).trim() : '';
    // La descripción es la columna A (índice 0) de la segunda fila del par.
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
      diasDisponibles = 'N/A'; // No se puede calcular si no hay consumo/reorder
    }
    
    // Solo se añade la fila si tiene un código de producto.
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

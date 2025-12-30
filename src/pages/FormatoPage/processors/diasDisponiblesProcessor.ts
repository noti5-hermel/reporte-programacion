/**
 * @file diasDisponiblesProcessor.ts
 * @description Contiene la lógica para procesar un archivo Excel con los días y horas disponibles.
 */

/**
 * Procesa las filas de un archivo Excel para generar un reporte de días disponibles.
 * 
 * @param {any[][]} excelRows - Las filas de la tabla parseadas del archivo Excel.
 * @returns {Array<Array<string | number>>} Los datos listos para ser convertidos a otra hoja de Excel.
 */
export const processDiasDisponibles = (excelRows: any[][]): (string | number)[][] => {
  // Valida que el archivo tenga al menos una fila de cabecera y una de datos.
  if (!excelRows || excelRows.length < 2) {
    return [['Error'], ['El archivo Excel no contiene datos suficientes o está vacío.']];
  }

  // Asume que la primera fila es la cabecera y el resto son datos.
  const header = excelRows[0].map(cell => String(cell).trim());
  const data = excelRows.slice(1).map(row => {
    // Se asegura de que cada fila tenga el formato esperado.
    const day = row[0] ? String(row[0]).trim() : '';
    const availableHours = row[1] ? Number(row[1]) : 0;
    // Ignora filas que no tengan un día especificado.
    return day ? [day, availableHours] : null;
  }).filter(row => row !== null) as (string | number)[][]; // Filtra las filas nulas.

  if (data.length === 0) {
    return [
      header,
      ['No se encontraron filas con datos válidos en el archivo.', '']
    ];
  }

  // Devuelve la cabecera original junto con los datos limpios.
  return [header, ...data];
};

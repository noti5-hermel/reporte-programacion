import { useState, useMemo } from "react";
import { UploadCloud } from "lucide-react";
import * as XLSX from "xlsx";

type ComparisonRow = {
  codigo: string;
  descripcion: string;
  tipo: string;
  numeroPersonas: number;
  totalTiempoReal: number;
  unitsReq: number;
  diffPercent: number | null;
};

export default function Comparacion() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [comparisonData, setComparisonData] = useState<ComparisonRow[]>([]);
  const [resumenFile, setResumenFile] = useState<File | null>(null);
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<string>("");

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    // Por ahora solo guardamos la fecha seleccionada, la comparación se hace a partir de los archivos.
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileType === 'resumen') {
        setResumenFile(file);
      } else {
        setDocumentoFile(file);
      }
    }
  };

  const readExcelAsRows = (file: File): Promise<any[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error("No se pudo leer el archivo."));
            return;
          }

          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });

          resolve(rows);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Error al leer el archivo."));
      };

      reader.readAsBinaryString(file);
    });
  };

  const handleComparison = async () => {
    if (!resumenFile || !documentoFile) {
      alert("Debes seleccionar ambos archivos (Resumen y Documento Real).");
      return;
    }

    try {
      const [resumenRows, documentoRows] = await Promise.all([
        readExcelAsRows(resumenFile),
        readExcelAsRows(documentoFile),
      ]);

      if (resumenRows.length < 2 || documentoRows.length < 2) {
        alert("Alguno de los archivos no tiene datos suficientes.");
        return;
      }

      // Función mejorada para parsear números
      const parseNumber = (value: any): number => {
        if (value === null || value === undefined || value === "") return 0;
        const str = String(value)
          .trim()
          .replace(/,/g, ".") // Reemplazar comas por puntos
          .replace(/\s/g, ""); // Eliminar espacios
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
      };

      // Debug: mostrar las primeras filas de ambos archivos
      console.log("Primeras 3 filas del Resumen:", resumenRows.slice(0, 3));
      console.log("Primeras 3 filas del Documento Real:", documentoRows.slice(0, 3));

      // Asumimos el orden de columnas indicado por el usuario
      // Resumen: A:Codigo, B:Descripcion, C:Tipo, D:Numero de personas, E:total tiempo real
      const resumenData = resumenRows.slice(1).filter((row) => row[0]);

      // Documento real: A:Components, B:Units Req, C:Product, D:Description
      // Empezar desde la fila 3 (índice 2, saltando las primeras 2 filas)
      const documentoData = documentoRows.slice(2).filter((row) => row[0]);

      // Crear un mapa de Units Req por código de PRODUCTO
      // Resumen: código = columna A
      // Documento real: código = columna C (Product)
      // Solo se toma UN valor por código (no se suman todas las filas).
      // Si hay varias filas con el mismo código, se usa la PRIMERA que aparezca.
      const unitsReqByCode: Record<string, number> = {};
      documentoData.forEach((row, index) => {
        const code = String(row[2] ?? "").trim(); // Columna C: Product
        const unitsReqValue = row[1]; // Columna B (Units Req)
        const unitsReq = parseNumber(unitsReqValue);

        if (!code) return;

        // Si ya tenemos un valor para este código, NO lo sobreescribimos.
        if (unitsReqByCode[code] !== undefined) {
          return;
        }

        unitsReqByCode[code] = unitsReq;

        // Debug: mostrar algunos valores para verificar
        if (index < 5) {
          console.log(`Código: ${code}, Units Req raw: ${unitsReqValue}, parsed: ${unitsReq}`);
        }
      });

      // Debug: mostrar el mapa completo
      console.log("Mapa de Units Req por código:", unitsReqByCode);

      const result: ComparisonRow[] = resumenData.map((row) => {
        const codigo = String(row[0]).trim();
        const descripcion = String(row[1] ?? "").trim();
        const tipo = String(row[2] ?? "").trim(); // Columna C (Tipo)
        const numeroPersonas = parseNumber(row[3]); // Columna D (Número de personas)
        const totalTiempoReal = parseNumber(row[4]); // Columna E (total tiempo real)

        const unitsReq = unitsReqByCode[codigo] ?? 0;
        
        // Debug: mostrar algunos códigos para verificar coincidencias
        if (resumenData.indexOf(row) < 5) {
          console.log(`Resumen - Código: ${codigo}, Total Tiempo Real: ${totalTiempoReal}, Units Req encontrado: ${unitsReq}`);
        }

        let diffPercent: number | null = null;
        if (unitsReq !== 0) {
          const diff = (unitsReq - totalTiempoReal) / unitsReq;
          diffPercent = diff * 100;
        }

        return {
          codigo,
          descripcion,
          tipo,
          numeroPersonas,
          totalTiempoReal,
          unitsReq,
          diffPercent,
        };
      }).filter((row) => row.totalTiempoReal !== 0);

      setComparisonData(result);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al procesar los archivos. Ver consola para más detalles.");
    }
  };

  // Calcular los tipos únicos disponibles
  const tiposUnicos = useMemo(() => {
    return Array.from(new Set(comparisonData.map((row) => row.tipo).filter(Boolean))).sort();
  }, [comparisonData]);

  // Filtrar datos según el tipo seleccionado
  const filteredData = useMemo(() => {
    if (!selectedTipo) {
      return comparisonData;
    }
    return comparisonData.filter((row) => row.tipo === selectedTipo);
  }, [comparisonData, selectedTipo]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Comparación de Archivos Excel</h1>

      <div className="flex items-center space-x-4">
        <label htmlFor="date-select" className="text-lg font-semibold">
          Selecciona una fecha:
        </label>
        <select
          id="date-select"
          value={selectedDate}
          onChange={handleDateChange}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="">--Selecciona una fecha--</option>
          <option value="2023-10-26">26 de Octubre de 2023</option>
          <option value="2023-10-25">25 de Octubre de 2023</option>
          <option value="2023-10-24">24 de Octubre de 2023</option>
        </select>
        <label htmlFor="resumen-upload" className="p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100">
          <UploadCloud className="inline-block mr-2" />
          {resumenFile ? resumenFile.name : "Importar Resumen"}
          <input id="resumen-upload" type="file" className="hidden" onChange={(e) => handleFileChange(e, 'resumen')} />
        </label>
        <label htmlFor="documento-upload" className="p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100">
          <UploadCloud className="inline-block mr-2" />
          {documentoFile ? documentoFile.name : "Importar Documento Real"}
          <input id="documento-upload" type="file" className="hidden" onChange={(e) => handleFileChange(e, 'documento')} />
        </label>
        {resumenFile && documentoFile && (
          <button onClick={handleComparison} className="p-2 border border-gray-300 rounded-lg bg-blue-500 text-white hover:bg-blue-600">
            Realizar Comparación
          </button>
        )}
      </div>

      {comparisonData.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Resultados de la Comparación
            </h2>
            <div className="flex items-center space-x-4">
              <label htmlFor="tipo-filter" className="text-sm font-medium">
                Filtrar por Tipo:
              </label>
              <select
                id="tipo-filter"
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                {tiposUnicos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b">Código</th>
                  <th className="py-2 px-4 border-b">Descripción</th>
                  <th className="py-2 px-4 border-b">Tipo</th>
                  <th className="py-2 px-4 border-b">Número de Personas</th>
                  <th className="py-2 px-4 border-b">Total Tiempo Real (Resumen)</th>
                  <th className="py-2 px-4 border-b">Units Req (Documento Real)</th>
                  <th className="py-2 px-4 border-b">% Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row) => {
                  const isOverThreshold =
                    row.diffPercent !== null && row.diffPercent > 25;

                  return (
                    <tr key={row.codigo} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{row.codigo}</td>
                      <td className="py-2 px-4 border-b">{row.descripcion}</td>
                      <td className="py-2 px-4 border-b">{row.tipo}</td>
                      <td className="py-2 px-4 border-b">{row.numeroPersonas}</td>
                      <td className="py-2 px-4 border-b">
                        {row.totalTiempoReal.toFixed(3)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {row.unitsReq.toFixed(3)}
                      </td>
                      <td
                        className={`py-2 px-4 border-b ${
                          isOverThreshold ? "text-red-600 font-semibold" : ""
                        }`}
                      >
                        {row.diffPercent !== null
                          ? `${row.diffPercent.toFixed(2)}%`
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
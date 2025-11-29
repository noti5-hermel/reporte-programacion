git import { useState } from "react";
import { UploadCloud } from "lucide-react";

export default function Comparacion() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [resumenFile, setResumenFile] = useState<File | null>(null);
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    // Aquí deberías hacer la llamada a la API para obtener los datos de comparación para la fecha seleccionada
    // y luego actualizar el estado de comparisonData con los datos recibidos.
    // Por ahora, usaremos datos de ejemplo.
    if (date) {
      setComparisonData([
        { id: 1, producto: "Producto A", resumen: 100, externo: 95, diferencia: 5 },
        { id: 2, producto: "Producto B", resumen: 200, externo: 210, diferencia: -10 },
        { id: 3, producto: "Producto C", resumen: 150, externo: 150, diferencia: 0 },
      ]);
    } else {
      setComparisonData([]);
    }
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

  const handleComparison = () => {
    // Aquí va la lógica para comparar los dos archivos
    console.log("Comparando archivos:", resumenFile, documentoFile);
  }

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

      {selectedDate && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Resultados de la Comparación - {selectedDate}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Producto</th>
                  <th className="py-2 px-4 border-b">Resumen</th>
                  <th className="py-2 px-4 border-b">Externo</th>
                  <th className="py-2 px-4 border-b">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{row.id}</td>
                    <td className="py-2 px-4 border-b">{row.producto}</td>
                    <td className="py-2 px-4 border-b">{row.resumen}</td>
                    <td className="py-2 px-4 border-b">{row.externo}</td>
                    <td className="py-2 px-4 border-b">{row.diferencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
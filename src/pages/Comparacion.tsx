import { useState } from "react";
import { UploadCloud } from "lucide-react";

export default function Comparacion() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [comparisonData, setComparisonData] = useState<any[]>([]);

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
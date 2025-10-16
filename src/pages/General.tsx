import { useState, useMemo } from "react";
import { DataTable } from "../components/Table";
import { SearchBar } from "../components/SearchBar/SearchBar";

const mockData = [
  // (Assuming mockData is the same as before)
  {
    fecha: "2025-10-15",
    codigo: "P001",
    descripcion: "Producto A",
    lote: "L-123",
    tipo: "Tipo1",
    actividad: "Empaque",
    horas: 5,
    cantidad: 200,
    minutos: 300,
    personas: 4,
    totalHoras: 20,
    promedio: 5,
  },
  {
    fecha: "2025-10-16",
    codigo: "P002",
    descripcion: "Producto B",
    lote: "L-124",
    tipo: "Tipo2",
    actividad: "Montaje",
    horas: 8,
    cantidad: 150,
    minutos: 480,
    personas: 3,
    totalHoras: 24,
    promedio: 8,
  },
  // ... more data
];

export default function General() {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredData = useMemo(() => {
    let data = mockData;

    if (searchQuery) {
      data = data.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (startDate) {
      data = data.filter(
        (item) => new Date(item.fecha) >= new Date(startDate)
      );
    }

    if (endDate) {
      data = data.filter(
        (item) => new Date(item.fecha) <= new Date(endDate)
      );
    }

    return data;
  }, [searchQuery, startDate, endDate]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Listado General</h1>
      </div>

      <div className="flex items-center gap-4">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="flex flex-col">
          <label htmlFor="start-date" className="text-sm font-medium text-gray-600">Fecha de inicio</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="end-date" className="text-sm font-medium text-gray-600">Fecha de fin</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <DataTable type="general" data={filteredData} />
    </div>
  );
}

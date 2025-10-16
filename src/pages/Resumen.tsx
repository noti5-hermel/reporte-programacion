import { useState, useMemo } from "react";
import { DataTable } from "../components/Table";
import { SearchBar } from "../components/SearchBar/SearchBar";

const mockResumen = [
  // (Assuming mockResumen is the same as before)
  {
    codigo: "P001",
    descripcion: "Producto A",
    tipo: "Tipo1",
    sumaTotalHoras: 20,
    sumCantidad: 400,
    promTiempoProducto: 0.05,
    numeroPersonas: 4,
  },
  {
    codigo: "P002",
    descripcion: "Producto B",
    tipo: "Tipo2",
    sumaTotalHoras: 30,
    sumCantidad: 600,
    promTiempoProducto: 0.05,
    numeroPersonas: 5,
  },
  // ... more data
];

export default function Resumen() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return mockResumen;
    }
    return mockResumen.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Resumen por Producto</h1>
      </div>
      <div className="flex items-center gap-4">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </div>
      <DataTable type="resumen" data={filteredData} />
    </div>
  );
}

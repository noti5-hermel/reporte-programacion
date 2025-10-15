import { DataTable } from "../components/Table";

const mockData = [
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
];

export default function General() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Listado General</h1>
      <DataTable type="general" data={mockData} />
    </div>
  );
}

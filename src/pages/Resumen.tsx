import { DataTable } from "../components/Table";

const mockResumen = [
  {
    codigo: "P001",
    descripcion: "Producto A",
    tipo: "Tipo1",
    sumaTotalHoras: 20,
    sumCantidad: 400,
    promTiempoProducto: 0.05,
    numeroPersonas: 4,
  },
];

export default function Resumen() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Resumen por Producto</h1>
      <DataTable type="resumen" data={mockResumen} />
    </div>
  );
}

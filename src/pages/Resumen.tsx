import Card from "../components/Card/Card";
import Table from "../components/Table/Table";

const mockResumen = [
  ["P001", "Producto A", "Tipo1", 20, 400, 0.05, 4],
];

const headers = [
  "Código",
  "Descripción",
  "Tipo",
  "Suma Total Horas",
  "Suma Cantidad",
  "Promedio Tiempo Producto",
  "Número de Personas",
];

export default function Resumen() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold text-venice-blue">Resumen por Producto</h1>
      <Card>
        <Table headers={headers} data={mockResumen} />
      </Card>
    </div>
  );
}

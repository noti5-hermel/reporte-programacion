import { useState } from "react";
import Card from "../components/Card/Card";
import Table from "../components/Table/Table";
import TableHeader from "../components/Table/TableHeader";
import TableFooter from "../components/Table/TableFooter";

const mockData = [
  [
    "2025-10-15",
    "P001",
    "Producto A",
    "L-123",
    "Tipo1",
    "Empaque",
    5,
    "View Details",
  ],
  [
    "2025-10-16",
    "P002",
    "Producto B",
    "L-124",
    "Tipo2",
    "Ensamblaje",
    8,
    "View Details",
  ],
  ...Array.from({ length: 18 }, (_, i) => [
    `2025-10-${17 + i}`,
    `P00${3 + i}`,
    `Producto ${String.fromCharCode(67 + i)}`,
    `L-12${5 + i}`,
    `Tipo${(i % 3) + 1}`,
    i % 2 === 0 ? "Empaque" : "Ensamblaje",
    Math.floor(Math.random() * 8) + 1,
    "View Details",
  ]),
];

const headers = [
  "Fecha",
  "Código",
  "Descripción",
  "Lote",
  "Tipo",
  "Actividad",
  "Horas",
  "Acciones",
];

export default function General() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredData = mockData.filter((row) =>
    row.some(
      (cell) =>
        cell &&
        cell.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const totalRecords = filteredData.length;

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Listado General</h1>
        <p className="text-gray-600">Gestiona y visualiza la información de las actividades</p>
      </div>
      <Card>
        <TableHeader onSearch={setSearch} />
        <Table headers={headers} data={paginatedData} />
        <TableFooter
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalRecords={totalRecords}
          pageSize={pageSize}
        />
      </Card>
    </div>
  );
}

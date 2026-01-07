import { useState, useMemo, useEffect } from "react";
import { DataTable } from "../components/Table";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { API_BASE_URL } from "../api/config";

const DisponibilidadPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/v1/reports/disponibilidad`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
          const result = await response.json();
          setData(Array.isArray(result) ? result : []);
        } else {
          setError("No se pudieron cargar los datos de disponibilidad.");
        }
      } catch (err) {
        setError("Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Reporte de Disponibilidad de Inventario</h1>
      
      <div className="flex items-center">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </div>

      {loading ? (
        <p>Cargando datos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <DataTable type="disponibilidad" data={filteredData} />
      )}
    </div>
  );
};

export default DisponibilidadPage;

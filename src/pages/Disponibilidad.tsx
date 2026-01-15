import { useState, useMemo, useEffect } from "react";
import { DataTable } from "../../components/Table";
import { SearchBar } from "../../components/SearchBar";
import { API_BASE_URL } from "../../api/config";

const DisponibilidadPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Estados para filtros y ordenamiento ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<string>(""); // 'alpha', 'reorder_desc', 'dias_asc'
  const [diasFilter, setDiasFilter] = useState("");
  const [reorderFilter, setReorderFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No estás autenticado.");
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/v1/available/`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
          const result = await response.json();
          setData(Array.isArray(result) ? result : []);
        } else {
          setError("No se pudieron cargar los datos.");
        }
      } catch (err) {
        setError("Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Lógica de filtrado y ordenamiento ---
  const processedData = useMemo(() => {
    let filtered = [...data];

    // 1. Filtro de búsqueda general
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // 2. Filtro por Días Disponibles (mayor o igual que)
    const diasNum = parseInt(diasFilter, 10);
    if (!isNaN(diasNum)) {
      filtered = filtered.filter((item) => item.dias_disponibles >= diasNum);
    }

    // 3. Filtro por Reorden (mayor o igual que)
    const reorderNum = parseInt(reorderFilter, 10);
    if (!isNaN(reorderNum)) {
      filtered = filtered.filter((item) => item.reorder >= reorderNum);
    }

    // 4. Ordenamiento
    if (sortType === 'alpha') {
      filtered.sort((a, b) => String(a.description).localeCompare(String(b.description)));
    } else if (sortType === 'reorder_desc') {
      filtered.sort((a, b) => Number(b.reorder) - Number(a.reorder));
    } else if (sortType === 'dias_asc') {
      filtered.sort((a, b) => Number(a.dias_disponibles) - Number(b.dias_disponibles));
    }

    return filtered;
  }, [data, searchQuery, diasFilter, reorderFilter, sortType]);

  const resetFilters = () => {
    setSearchQuery('');
    setSortType('');
    setDiasFilter('');
    setReorderFilter('');
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Reporte de Disponibilidad de Inventario</h1>
      
      {/* --- Panel de Filtros -- */}
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Búsqueda general */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar en todo</label>
            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          </div>

          {/* Filtro Días Disponibles */}
          <div>
            <label htmlFor="dias-filter" className="block text-sm font-medium text-gray-700 mb-1">Días Disp. ≥</label>
            <input
              id="dias-filter" type="number" value={diasFilter} min="0"
              onChange={(e) => setDiasFilter(e.target.value)}
              className="w-full p-2 border rounded-md shadow-sm"
              placeholder="Ej: 30"
            />
          </div>

          {/* Filtro Reorden */}
          <div>
            <label htmlFor="reorder-filter" className="block text-sm font-medium text-gray-700 mb-1">Reorden ≥</label>
            <input
              id="reorder-filter" type="number" value={reorderFilter} min="0"
              onChange={(e) => setReorderFilter(e.target.value)}
              className="w-full p-2 border rounded-md shadow-sm"
              placeholder="Ej: 500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Ordenar por:</span>
                <button onClick={() => setSortType('alpha')} className={`px-3 py-1 text-sm rounded-full ${sortType === 'alpha' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Descripción (A-Z)</button>
                <button onClick={() => setSortType('reorder_desc')} className={`px-3 py-1 text-sm rounded-full ${sortType === 'reorder_desc' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Reorden (Mayor a menor)</button>
                <button onClick={() => setSortType('dias_asc')} className={`px-3 py-1 text-sm rounded-full ${sortType === 'dias_asc' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Días Disp. (Menor a mayor)</button>
            </div>
            <button onClick={resetFilters} className="px-4 py-1 text-sm font-semibold text-red-600 bg-red-100 rounded-full hover:bg-red-200">Limpiar Filtros</button>
        </div>
      </div>

      {/* --- Tabla de Datos -- */}
      {loading ? (
        <p>Cargando datos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <DataTable type="disponibilidad" data={processedData} />
      )}
    </div>
  );
};

export default DisponibilidadPage;

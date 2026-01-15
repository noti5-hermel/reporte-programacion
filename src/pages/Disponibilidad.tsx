import { useState, useMemo, useEffect } from "react";
import { DataTable } from "../components/Table";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { API_BASE_URL } from "../api/config";

// --- Función de ayuda para la agrupación ---
const getBaseDescription = (desc: string) => {
  const words = desc.trim().split(/\s+/);
  // Intenta encontrar una palabra que indique peso/unidad (g, kg, ml, l, un)
  const unitIndex = words.findIndex(word => 
    /\d+(g|kg|ml|l|un|cm|m)[s]?$/i.test(word)
  );
  // Si se encuentra, corta la descripción hasta esa palabra
  if (unitIndex > 1) { // Asegura no cortar demasiado pronto
    return words.slice(0, unitIndex).join(' ');
  }
  // Fallback: si no encuentra una unidad clara, busca el último número
  const lastNumIndex = words.map(w => /^\d+$/.test(w)).lastIndexOf(true);
  if (lastNumIndex > 1) {
    return words.slice(0, lastNumIndex).join(' ');
  }

  return desc; // Devuelve original si no hay patrón claro
};


const DisponibilidadPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Estados para filtros y ordenamiento ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<string>("");
  const [diasFilter, setDiasFilter] = useState("");
  const [reorderFilter, setReorderFilter] = useState("");
  const [groupByProduct, setGroupByProduct] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No estás autenticado."); return;
        }
        const response = await fetch(`${API_BASE_URL}/api/v1/available/`, { headers: { "Authorization": `Bearer ${token}` } });
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

  // --- Lógica de filtrado, agrupación y ordenamiento ---
  const processedData = useMemo(() => {
    let processed = [...data];

    // 1. Agrupación (si está activa)
    if (groupByProduct) {
      const grouped = new Map<string, any>();

      processed.forEach(item => {
        const baseDesc = getBaseDescription(item.description);
        const existing = grouped.get(baseDesc);

        if (existing) {
          existing.disponible += item.disponible;
          existing.minimo += item.minimo;
          existing.reorder += item.reorder;
          existing.dias_disponibles = Math.min(existing.dias_disponibles, item.dias_disponibles);
          existing.sub_items.push(item.codigo);
        } else {
          grouped.set(baseDesc, {
            ...item, // Copia la primera fila que encuentra
            codigo: "VAR-GRUP",
            description: baseDesc,
            dias_disponibles: item.dias_disponibles,
            date_upload: null, // La fecha individual no es relevante
            sub_items: [item.codigo],
          });
        }
      });

      processed = Array.from(grouped.values());
    }
    
    // 2. Filtro de búsqueda general
    if (searchQuery) {
      processed = processed.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // 3. Filtros numéricos
    const diasNum = parseInt(diasFilter, 10);
    if (!isNaN(diasNum)) {
      processed = processed.filter(item => item.dias_disponibles >= diasNum);
    }
    const reorderNum = parseInt(reorderFilter, 10);
    if (!isNaN(reorderNum)) {
      processed = processed.filter(item => item.reorder >= reorderNum);
    }

    // 4. Ordenamiento
    if (sortType === 'alpha') {
      processed.sort((a, b) => String(a.description).localeCompare(String(b.description)));
    } else if (sortType === 'reorder_desc') {
      processed.sort((a, b) => Number(b.reorder) - Number(a.reorder));
    } else if (sortType === 'dias_asc') {
      processed.sort((a, b) => Number(a.dias_disponibles) - Number(b.dias_disponibles));
    }

    return processed;
  }, [data, searchQuery, diasFilter, reorderFilter, sortType, groupByProduct]);

  const resetFilters = () => {
    setSearchQuery('');
    setSortType('');
    setDiasFilter('');
    setReorderFilter('');
    setGroupByProduct(false);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Reporte de Disponibilidad de Inventario</h1>
      
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar en todo</label>
            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          </div>
          <div>
            <label htmlFor="dias-filter" className="block text-sm font-medium text-gray-700 mb-1">Días Disp. ≥</label>
            <input id="dias-filter" type="number" value={diasFilter} min="0" onChange={(e) => setDiasFilter(e.target.value)} className="w-full p-2 border rounded-md shadow-sm" placeholder="Ej: 30"/>
          </div>
          <div>
            <label htmlFor="reorder-filter" className="block text-sm font-medium text-gray-700 mb-1">Reorden ≥</label>
            <input id="reorder-filter" type="number" value={reorderFilter} min="0" onChange={(e) => setReorderFilter(e.target.value)} className="w-full p-2 border rounded-md shadow-sm" placeholder="Ej: 500"/>
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

        <div className="flex items-center gap-4 pt-3 border-t">
            <label htmlFor="group-checkbox" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input id="group-checkbox" type="checkbox" checked={groupByProduct} onChange={(e) => setGroupByProduct(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Agrupar por producto
            </label>
        </div>
      </div>

      {loading ? <p>Cargando datos...</p> : error ? <p className="text-red-500">{error}</p> : <DataTable type="disponibilidad" data={processedData} />}
    </div>
  );
};

export default DisponibilidadPage;

import { useState, useMemo, useEffect } from "react";
import { DataTable } from "../components/Table";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { API_BASE_URL } from "../api/config";
import { Calendar, Users, Activity, CheckCircle } from "lucide-react";

export default function Rendimiento() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("Todos");

  const fetchData = async (date: string) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/task-performance`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const transformed = Array.isArray(result)
          ? result.map((item: any) => ({
              ...item,
              team_name: item.equipo || item.team_name || "General",
              real_minutes: item.minutes || item.minutos || item.real_minutes || 0,
              productividad: item.productividad || 0,
              real_quantity: item.cantidad || item.real_quantity || 0,
              scheduled_quantity: item.scheduled_quantity || item.cantidad || 0,
            }))
          : [];
        
        // Filtrar por la fecha seleccionada solo si hay una fecha
        const filteredByDate = transformed.filter(item => {
          if (!date) return true;
          if (!item.fecha) return false;
          return item.fecha.startsWith(date);
        });

        setData(filteredByDate);
      } else {
        setError("Error al cargar los datos de rendimiento");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const uniqueTeams = useMemo(() => {
    const teams = new Set(data.map(item => item.team_name));
    return ["Todos", ...Array.from(teams)].sort();
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = data;
    
    if (selectedTeam !== "Todos") {
      filtered = filtered.filter(item => item.team_name === selectedTeam);
    }

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    return filtered;
  }, [data, searchQuery, selectedTeam]);

  // Métricas rápidas
  const stats = useMemo(() => {
    if (filteredData.length === 0) return { avgProd: 0, completed: 0, total: 0, teams: 0 };
    
    const total = filteredData.length;
    const completed = filteredData.filter(d => (d.real_quantity > 0 || d.is_completed)).length;
    const avgProd = filteredData.reduce((acc, curr) => acc + (parseFloat(curr.productividad) || 0), 0) / total;
    const uniqueTeamsCount = new Set(filteredData.map(d => d.team_name)).size;
    
    return { avgProd, completed, total, teams: uniqueTeamsCount };
  }, [filteredData]);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel de Rendimiento</h1>
          <p className="text-slate-500 text-sm">Monitoreo en tiempo real de productividad por equipo</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="text-blue-600 w-5 h-5" />
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-w-[150px]"
            >
              {uniqueTeams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="text-blue-600 w-5 h-5" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase">Equipos</p>
            <p className="text-xl font-bold text-slate-800">{stats.teams}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase">Eficiencia Prom.</p>
            <p className="text-xl font-bold text-slate-800">{stats.avgProd.toFixed(1)}%</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase">Tareas</p>
            <p className="text-xl font-bold text-slate-800">{stats.completed} / {stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase">Progreso</p>
            <p className="text-xl font-bold text-slate-800">
              {stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-lg font-semibold text-slate-700">Detalle de Ejecución</h2>
          <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <DataTable type="rendimiento" data={filteredData} loading={loading} />
      </div>
    </div>
  );
}

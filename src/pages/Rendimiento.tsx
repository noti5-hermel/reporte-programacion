import { useState, useMemo, useEffect } from "react";
import { DataTable } from "../components/Table";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { rendimientoService } from "../services/rendimientoService";
import type { RendimientoStats, RendimientoDetailItem } from "../services/rendimientoService";
import { operatorPerformanceService } from "../services/operatorPerformanceService";
import { Calendar, Users, Activity, CheckCircle, User, FileDown } from "lucide-react";

type ViewMode = "tasks" | "operators";

export default function Rendimiento() {
  const [detailData, setDetailData] = useState<RendimientoDetailItem[]>([]);
  const [stats, setStats] = useState<RendimientoStats>({
    equipos: 0, eficiencia_promedio: 0, tareas_completadas: 0, tareas_totales: 0, progreso: 0,
  });
  const [operatorData, setOperatorData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTeam, setSelectedTeam] = useState("Todos");
  const [viewMode, setViewMode] = useState<ViewMode>("tasks");

  const today = new Date().toISOString().split("T")[0];

  const fetchData = async (date: string) => {
    setLoading(true);
    setError("");
    try {
      if (viewMode === "operators") {
        const endDate = date || today;
        const startDate = date
          ? date
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const result = await operatorPerformanceService.getOperatorPerformance(startDate, endDate);
        setOperatorData(Array.isArray(result) ? result : []);
        setDetailData([]);
      } else {
        const teamParam = selectedTeam !== "Todos" ? selectedTeam : null;
        const result = await rendimientoService.getRendimiento(date || today, teamParam);
        setStats(result.stats);
        setDetailData(result.detail);
        setOperatorData([]);
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      setDetailData([]);
      setOperatorData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate, viewMode]);

  const uniqueTeams = useMemo(() => {
    if (viewMode === "operators") {
      const teams = new Set(operatorData.flatMap((item: any) => (item.teams || "").split(", ").filter(Boolean)));
      return ["Todos", ...Array.from(teams)].sort();
    }
    const teams = new Set(detailData.map((item) => item.equipo));
    return ["Todos", ...Array.from(teams)].sort();
  }, [detailData, operatorData, viewMode]);

  const filteredData = useMemo(() => {
    if (viewMode === "operators") {
      let filtered = operatorData;
      if (selectedTeam !== "Todos") {
        filtered = filtered.filter((item: any) =>
          (item.teams || "").includes(selectedTeam)
        );
      }
      if (searchQuery) {
        filtered = filtered.filter((item: any) =>
          Object.values(item).some((value) =>
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }
      return filtered;
    }

    let filtered = detailData;
    if (selectedTeam !== "Todos") {
      filtered = filtered.filter((item) => item.equipo === selectedTeam);
    }
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    return filtered;
  }, [detailData, operatorData, searchQuery, selectedTeam, viewMode]);

  const displayStats = useMemo(() => {
    if (viewMode === "operators") {
      const total = operatorData.length;
      const completed = operatorData.filter((d: any) => d.completion_rate > 0).length;
      const avgProd = operatorData.reduce((acc: number, curr: any) => acc + (parseFloat(curr.real_productivity) || 0), 0) / (total || 1);
      const teamsCount = new Set(operatorData.flatMap((d: any) => (d.teams || "").split(", ").filter(Boolean))).size;
      return { card1: total, card2: avgProd, card3: `${completed} / ${total}`, card4: total > 0 ? ((completed / total) * 100).toFixed(0) : "0" };
    }

    return {
      card1: stats.equipos,
      card2: stats.eficiencia_promedio,
      card3: `${stats.tareas_completadas} / ${stats.tareas_totales}`,
      card4: stats.progreso,
    };
  }, [stats, operatorData, viewMode]);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel de Rendimiento</h1>
          <p className="text-slate-500 text-sm">Monitoreo en tiempo real de productividad</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("tasks")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "tasks"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Por Tarea
            </button>
            <button
              onClick={() => setViewMode("operators")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "operators"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Por Operario
            </button>
          </div>
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
              max={today}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => rendimientoService.downloadExcel(detailData, stats, selectedDate, selectedTeam)}
            disabled={loading || detailData.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            Descargar Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            {viewMode === "operators" ? <User className="w-6 h-6" /> : <Users className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase">
              {viewMode === "operators" ? "Operarios" : "Equipos"}
            </p>
            <p className="text-xl font-bold text-slate-800">{displayStats.card1}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase">
              {viewMode === "operators" ? "Prod. Real (und/h)" : "Eficiencia Prom."}
            </p>
            <p className="text-xl font-bold text-slate-800">
              {viewMode === "operators" ? displayStats.card2.toFixed(1) : `${displayStats.card2}%`}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase">Tareas</p>
            <p className="text-xl font-bold text-slate-800">{displayStats.card3}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase">Progreso</p>
            <p className="text-xl font-bold text-slate-800">{displayStats.card4}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-lg font-semibold text-slate-700">
            {viewMode === "operators" ? "Rendimiento por Operario" : "Detalle de Ejecución"}
          </h2>
          <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <DataTable type={viewMode === "operators" ? "operators" : "rendimiento"} data={filteredData} loading={loading} />
      </div>
    </div>
  );
}

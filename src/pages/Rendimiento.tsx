import { useState, useMemo, useEffect } from "react";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { rendimientoService } from "../services/rendimientoService";
import type { RendimientoStats, RendimientoDetailItem, RendimientoMensualResponse, TeamMonthly } from "../services/rendimientoService";
import { Calendar, Users, Activity, CheckCircle, FileDown, ChevronDown, ChevronRight } from "lucide-react";

type ViewMode = "tasks" | "monthly";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function Rendimiento() {
  const [detailData, setDetailData] = useState<RendimientoDetailItem[]>([]);
  const [stats, setStats] = useState<RendimientoStats>({
    equipos: 0, eficiencia_promedio: 0, tareas_completadas: 0, tareas_totales: 0, progreso: 0,
  });
  const [monthlyData, setMonthlyData] = useState<RendimientoMensualResponse | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTeam, setSelectedTeam] = useState("Todos");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>("tasks");

  const today = new Date().toISOString().split("T")[0];

  const fetchData = async (date: string) => {
    setLoading(true);
    setError("");
    try {
      if (viewMode === "monthly") {
        const result = await rendimientoService.getRendimientoMensual(selectedYear, selectedMonth);
        setMonthlyData(result);
        setDetailData([]);
      } else {
        const teamParam = selectedTeam !== "Todos" ? selectedTeam : null;
        const result = await rendimientoService.getRendimiento(date || today, teamParam);
        setStats(result.stats);
        setDetailData(result.detail);
        setMonthlyData(null);
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      setDetailData([]);
      setMonthlyData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate, selectedMonth, selectedYear, viewMode]);

  const uniqueTeams = useMemo(() => {
    const teams = new Set(detailData.map((item) => item.equipo));
    return ["Todos", ...Array.from(teams)].sort();
  }, [detailData]);

  const filteredData = useMemo(() => {
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
  }, [detailData, searchQuery, selectedTeam]);

  const teamsGrouped = useMemo(() => {
    const groups: Record<string, { tasks: typeof filteredData; rendimientos: number[]; completadas: number; total: number }> = {};
    for (const item of filteredData) {
      const team = item.equipo || "Sin equipo";
      if (!groups[team]) {
        groups[team] = { tasks: [], rendimientos: [], completadas: 0, total: 0 };
      }
      groups[team].tasks.push(item);
      groups[team].total++;
      if (item.rendimiento != null) {
        groups[team].rendimientos.push(item.rendimiento);
      }
      if (item.tiempo_real != null) {
        groups[team].completadas++;
      }
    }
    return Object.entries(groups).map(([equipo, data]) => ({
      equipo,
      tasks: data.tasks,
      promedio: data.rendimientos.length > 0
        ? data.rendimientos.reduce((a, b) => a + b, 0) / data.rendimientos.length
        : null,
      completadas: data.completadas,
      total: data.total,
    }));
  }, [filteredData]);

  const displayStats = useMemo(() => {
    if (viewMode === "monthly" && monthlyData) {
      return {
        card1: monthlyData.stats.equipos,
        card2: monthlyData.stats.eficiencia_promedio,
        card3: `${monthlyData.stats.tareas_completadas} / ${monthlyData.stats.tareas_totales}`,
        card4: monthlyData.stats.tareas_totales > 0
          ? Math.round((monthlyData.stats.tareas_completadas / monthlyData.stats.tareas_totales) * 100)
          : 0,
      };
    }
    return {
      card1: stats.equipos,
      card2: stats.eficiencia_promedio,
      card3: `${stats.tareas_completadas} / ${stats.tareas_totales}`,
      card4: stats.progreso,
    };
  }, [stats, monthlyData, viewMode]);

  return (
    <div className="flex flex-col gap-6 p-6 bg-background-primary min-h-screen">
      <div className="bg-background-secondary border border-border-card rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-title">Panel de Rendimiento</h1>
          <p className="text-subtitle text-sm">Monitoreo en tiempo real de productividad</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-background-primary rounded-xl p-1 border border-border-card">
            <button
              onClick={() => setViewMode("tasks")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === "tasks"
                  ? "bg-button-primary text-white shadow-btn-glow"
                  : "text-subtitle hover:text-title"
              }`}
            >
              Diario
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === "monthly"
                  ? "bg-button-primary text-white shadow-btn-glow"
                  : "text-subtitle hover:text-title"
              }`}
            >
              Mensual
            </button>
          </div>

          {viewMode === "tasks" ? (
            <>
              <div className="flex items-center gap-2">
                <Users className="text-button-primary w-5 h-5" />
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="border border-border-card bg-background-primary rounded-xl px-3 py-2 text-sm font-bold text-title focus:ring-2 focus:ring-button-primary/20 focus:border-button-primary outline-none transition-all min-w-[150px]"
                >
                  {uniqueTeams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-button-primary w-5 h-5" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={today}
                  className="border border-border-card bg-background-primary rounded-xl px-3 py-2 text-sm font-bold text-title focus:ring-2 focus:ring-button-primary/20 focus:border-button-primary outline-none transition-all"
                />
              </div>
              <button
                onClick={() => rendimientoService.downloadExcel(detailData, stats, selectedDate, selectedTeam)}
                disabled={loading || detailData.length === 0}
                className="flex items-center gap-2 bg-button-primary hover:bg-button-primary-hover disabled:bg-background-primary disabled:text-subtitle text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-btn-glow hover:shadow-btn-glow-hover"
              >
                <FileDown className="w-4 h-4" />
                Descargar Excel
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Calendar className="text-button-primary w-5 h-5" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border border-border-card bg-background-primary rounded-xl px-3 py-2 text-sm font-bold text-title focus:ring-2 focus:ring-button-primary/20 focus:border-button-primary outline-none transition-all"
              >
                {MONTHS.map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border border-border-card bg-background-primary rounded-xl px-3 py-2 text-sm font-bold text-title focus:ring-2 focus:ring-button-primary/20 focus:border-button-primary outline-none transition-all w-20 text-center"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-background-secondary p-5 rounded-2xl border border-border-card shadow-sm flex items-center gap-4">
          <div className="bg-icon-bg p-3 rounded-xl text-button-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-subtitle text-xs font-bold uppercase tracking-wider">
              {viewMode === "monthly" ? "Equipos" : "Equipos"}
            </p>
            <p className="text-2xl font-black text-title">{displayStats.card1}</p>
          </div>
        </div>
        <div className="bg-background-secondary p-5 rounded-2xl border border-border-card shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl text-green-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-subtitle text-xs font-bold uppercase tracking-wider">Eficiencia Prom.</p>
            <p className="text-2xl font-black text-title">{displayStats.card2}%</p>
          </div>
        </div>
        <div className="bg-background-secondary p-5 rounded-2xl border border-border-card shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-subtitle text-xs font-bold uppercase tracking-wider">Tareas</p>
            <p className="text-2xl font-black text-title">{displayStats.card3}</p>
          </div>
        </div>
        <div className="bg-background-secondary p-5 rounded-2xl border border-border-card shadow-sm flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-subtitle text-xs font-bold uppercase tracking-wider">Progreso</p>
            <p className="text-2xl font-black text-title">{displayStats.card4}%</p>
          </div>
        </div>
      </div>

      <div className="bg-background-secondary border border-border-card rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-lg font-bold text-title">
            {viewMode === "monthly" ? "Rendimiento Mensual por Equipo" : "Detalle de Ejecución"}
          </h2>
          {viewMode === "tasks" && (
            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-bold text-sm">
            {error}
          </div>
        )}

        {viewMode === "monthly" ? (
          monthlyData && monthlyData.teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-background-primary border border-dashed border-border-card rounded-3xl">
              <p className="text-subtitle font-bold">No hay datos disponibles para este mes</p>
            </div>
          ) : loading ? (
            <p className="text-center text-subtitle py-10">Cargando datos...</p>
          ) : (
            <div className="space-y-4">
              {monthlyData?.teams.map((team) => {
                const rendColor = team.rendimiento_promedio !== null
                  ? (team.rendimiento_promedio >= 85 ? 'text-green-600' : team.rendimiento_promedio >= 60 ? 'text-yellow-600' : 'text-red-600')
                  : 'text-subtitle';
                const isExpanded = expandedTeam === team.team_id;

                return (
                  <div key={team.team_id} className="border border-border-card rounded-2xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setExpandedTeam(isExpanded ? null : team.team_id)}
                      className="w-full bg-gradient-to-r from-button-primary/5 to-button-primary/10 px-5 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-border-card hover:from-button-primary/10 hover:to-button-primary/20 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-subtitle" /> : <ChevronRight className="w-5 h-5 text-subtitle" />}
                        <h3 className="font-black text-lg text-title">{team.equipo}</h3>
                        <span className="text-sm font-bold text-subtitle">
                          {team.dias_con_datos} días · {team.tareas_completadas}/{team.tareas_totales} tareas
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-subtitle text-xs font-bold uppercase tracking-wider">Rendimiento Prom.</p>
                          <p className={`font-black text-base ${rendColor}`}>
                            {team.rendimiento_promedio !== null ? `${team.rendimiento_promedio.toFixed(1)}%` : "N/A"}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-subtitle text-xs font-bold uppercase tracking-wider">Progreso</p>
                          <p className="font-black text-base text-button-primary">{team.progreso}%</p>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead className="bg-background-primary text-subtitle text-xs uppercase tracking-wider">
                            <tr>
                              <th className="px-3 py-3 text-left font-bold">Fecha</th>
                              <th className="px-3 py-3 text-right font-bold">Tareas Totales</th>
                              <th className="px-3 py-3 text-right font-bold">Tareas Comp.</th>
                              <th className="px-3 py-3 text-right font-bold">Rendimiento</th>
                            </tr>
                          </thead>
                          <tbody>
                            {team.dias.map((dia, i) => {
                              const dRendColor = dia.rendimiento !== null
                                ? (dia.rendimiento >= 85 ? 'text-green-600 font-bold' : dia.rendimiento >= 60 ? 'text-yellow-600 font-bold' : 'text-red-600 font-bold')
                                : 'text-subtitle';
                              return (
                                <tr key={i} className="hover:bg-background-primary text-sm transition-colors even:bg-background-primary/50">
                                  <td className="px-3 py-2.5 border-b border-border-card">
                                    {new Date(dia.date).toLocaleDateString("es-ES", { day: "2-digit", month: "long" })}
                                  </td>
                                  <td className="px-3 py-2.5 border-b border-border-card text-right">{dia.tareas_totales}</td>
                                  <td className="px-3 py-2.5 border-b border-border-card text-right">{dia.tareas_completadas}</td>
                                  <td className={`px-3 py-2.5 border-b border-border-card text-right ${dRendColor}`}>
                                    {dia.rendimiento !== null ? `${dia.rendimiento.toFixed(2)}%` : "N/A"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : loading ? (
          <p className="text-center text-subtitle py-10">Cargando datos...</p>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-background-primary border border-dashed border-border-card rounded-3xl">
            <p className="text-subtitle font-bold">No hay datos disponibles</p>
          </div>
        ) : (
          <div className="space-y-6">
            {teamsGrouped.map((group) => {
              const rendColor = group.promedio !== null
                ? (group.promedio >= 85 ? 'text-green-600' : group.promedio >= 60 ? 'text-yellow-600' : 'text-red-600')
                : 'text-subtitle';
              const progress = group.total > 0 ? (group.completadas / group.total * 100).toFixed(0) : "0";

              return (
                <div key={group.equipo} className="border border-border-card rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-button-primary/5 to-button-primary/10 px-5 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-border-card">
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-lg text-title">{group.equipo}</h3>
                      <span className="text-sm font-bold text-subtitle">
                        {group.completadas}/{group.total} tareas
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-subtitle text-xs font-bold uppercase tracking-wider">Rendimiento Prom.</p>
                        <p className={`font-black text-base ${rendColor}`}>
                          {group.promedio !== null ? `${group.promedio.toFixed(1)}%` : "N/A"}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-subtitle text-xs font-bold uppercase tracking-wider">Progreso</p>
                        <p className="font-black text-base text-button-primary">{progress}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead className="bg-background-primary text-subtitle text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-3 text-left font-bold">Código</th>
                          <th className="px-3 py-3 text-left font-bold">Descripción</th>
                          <th className="px-3 py-3 text-left font-bold">Material</th>
                          <th className="px-3 py-3 text-left font-bold">Lote</th>
                          <th className="px-3 py-3 text-right font-bold">Cant. Plan.</th>
                          <th className="px-3 py-3 text-right font-bold">Cant. Real</th>
                          <th className="px-3 py-3 text-center font-bold">Inicio Plan</th>
                          <th className="px-3 py-3 text-center font-bold">Fin Plan</th>
                          <th className="px-3 py-3 text-right font-bold">T. Plan</th>
                          <th className="px-3 py-3 text-center font-bold">Inicio Real</th>
                          <th className="px-3 py-3 text-center font-bold">Fin Real</th>
                          <th className="px-3 py-3 text-right font-bold">T. Real</th>
                          <th className="px-3 py-3 text-right font-bold">Rendimiento</th>
                          <th className="px-3 py-3 text-left font-bold">Comentarios</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.tasks.map((row: any, i: number) => {
                          const formatTime = (val: string | null) => {
                            if (!val) return "-";
                            if (val.includes("T")) return val.slice(11, 19);
                            if (val.length >= 8) return val.slice(0, 8);
                            return val;
                          };
                          const rend = row.rendimiento;
                          const rendColor = rend !== null && rend !== undefined
                            ? (rend >= 85 ? 'text-green-600 font-bold' : rend >= 60 ? 'text-yellow-600 font-bold' : 'text-red-600 font-bold')
                            : 'text-subtitle';
                          return (
                            <tr key={i} className="hover:bg-background-primary text-sm transition-colors even:bg-background-primary/50">
                              <td className="px-3 py-2.5 border-b border-border-card">{row.codigo || "-"}</td>
                              <td className="px-3 py-2.5 border-b border-border-card">{row.description || "-"}</td>
                              <td className="px-3 py-2.5 border-b border-border-card">{row.material || "-"}</td>
                              <td className="px-3 py-2.5 border-b border-border-card font-mono">{row.lote || "-"}</td>
                              <td className="px-3 py-2.5 border-b border-border-card text-right">{row.cantidad_planificada ?? "-"}</td>
                              <td className="px-3 py-2.5 border-b border-border-card text-right">{row.cantidad_real ?? "-"}</td>
                              <td className="px-3 py-2.5 border-b border-border-card text-center text-xs">{formatTime(row.inicio_planificado)}</td>
                              <td className="px-3 py-2.5 border-b border-border-card text-center text-xs">{formatTime(row.final_planificado)}</td>
                              <td className="px-3 py-2.5 border-b border-border-card text-right font-mono">{row.tiempo_planificado ?? "-"}</td>
                              <td className="px-3 py-2.5 border-b border-border-card text-center text-xs">{formatTime(row.inicio_real)}</td>
                              <td className="px-3 py-2.5 border-b border-border-card text-center text-xs">{formatTime(row.final_real)}</td>
                              <td className="px-3 py-2.5 border-b border-border-card text-right font-mono">{row.tiempo_real != null ? row.tiempo_real.toFixed(2) : "-"}</td>
                              <td className={`px-3 py-2.5 border-b border-border-card text-right ${rendColor}`}>
                                {rend != null ? `${rend.toFixed(2)}%` : "N/A"}
                              </td>
                              <td className="px-3 py-2.5 border-b border-border-card text-xs max-w-[150px] truncate" title={row.comentarios || ""}>
                                {row.comentarios || "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import type { Row } from "exceljs";
import { REPORTS_API_URL, fetchWithAuth } from "../config/api";

// ExcelJS solo se necesita al exportar: se carga bajo demanda para no incluirlo
// en el bundle inicial.
async function createWorkbook() {
  const { default: ExcelJS } = await import("exceljs");
  return new ExcelJS.Workbook();
}

export interface RendimientoStats {
  equipos: number;
  eficiencia_promedio: number;
  tareas_completadas: number;
  tareas_totales: number;
  progreso: number;
}

export interface RendimientoDetailItem {
  date: string;
  team: string;
  equipo: string;
  description: string;
  codigo: string;
  material: string;
  lote: string;
  cantidad_planificada: number | null;
  cantidad_real: number | null;
  inicio_planificado: string | null;
  final_planificado: string | null;
  tiempo_planificado: number | null;
  inicio_real: string | null;
  final_real: string | null;
  tiempo_real: number | null;
  comentarios: string | null;
  rendimiento: number | null;
  [key: string]: unknown;
}

export interface RendimientoResponse {
  stats: RendimientoStats;
  detail: RendimientoDetailItem[];
}

export interface TeamMonthlyDay {
  date: string;
  rendimiento: number | null;
  tareas_totales: number;
  tareas_completadas: number;
}

export interface TeamMonthly {
  equipo: string;
  team_id: string;
  dias: TeamMonthlyDay[];
  dias_con_datos: number;
  rendimiento_promedio: number | null;
  tareas_totales: number;
  tareas_completadas: number;
  progreso: number;
}

export interface RendimientoMensualStats {
  equipos: number;
  eficiencia_promedio: number;
  tareas_completadas: number;
  tareas_totales: number;
}

export interface RendimientoMensualResponse {
  stats: RendimientoMensualStats;
  teams: TeamMonthly[];
}

/** La API devuelve una fila por día/equipo; el servicio la agrupa por equipo. */
interface RendimientoMensualRawRow {
  team_id: string;
  equipo: string;
  date: string;
  rendimiento: number | null;
  tareas_totales: number;
  tareas_completadas: number;
}

interface RendimientoMensualRawResponse {
  stats: RendimientoMensualStats;
  teams: RendimientoMensualRawRow[];
}

function formatShortDate(dateString: string) {
  if (!dateString) return "";
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }
  return dateString;
}

function formatTimeHHMM(dateString: string | null) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

const COLUMNS = [
  { header: "Equipo", key: "equipo", width: 18 },
  { header: "Descripción", key: "description", width: 40 },
  { header: "Código", key: "codigo", width: 15 },
  { header: "Material", key: "material", width: 22 },
  { header: "Lote", key: "lote", width: 14 },
  { header: "Cant. Plan.", key: "cantidad_planificada", width: 13 },
  { header: "Cant. Real", key: "cantidad_real", width: 13 },
  { header: "H. Ini. Plan.", key: "inicio_planificado", width: 14 },
  { header: "H. Fin. Plan.", key: "final_planificado", width: 14 },
  { header: "T. Plan.", key: "tiempo_planificado", width: 11 },
  { header: "H. Ini. Real", key: "inicio_real", width: 14 },
  { header: "H. Fin. Real", key: "final_real", width: 14 },
  { header: "T. Real", key: "tiempo_real", width: 11 },
  { header: "Rendimiento", key: "rendimiento", width: 13 },
  { header: "Comentarios", key: "comentarios", width: 28 },
] as const;

type ColumnKey = (typeof COLUMNS)[number]["key"];

/** Número de columna de Excel (1-based) derivado del nombre, nunca a mano. */
const COLUMN_NUMBER = Object.fromEntries(
  COLUMNS.map((column, index) => [column.key, index + 1])
) as Record<ColumnKey, number>;

interface TeamGroup {
  equipo: string;
  tasks: RendimientoDetailItem[];
  rendimientos: number[];
  completadas: number;
  total: number;
}

function groupByTeam(detail: RendimientoDetailItem[]): TeamGroup[] {
  const groups: Record<string, TeamGroup> = {};
  for (const item of detail) {
    const team = item.equipo || "Sin equipo";
    if (!groups[team]) {
      groups[team] = { equipo: team, tasks: [], rendimientos: [], completadas: 0, total: 0 };
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
  return Object.values(groups);
}

function computeTeamStats(team: TeamGroup) {
  const sumaPlan = team.tasks.reduce((s, t) => s + (t.tiempo_planificado ?? 0), 0);
  const sumaReal = team.tasks.reduce((s, t) => s + (t.tiempo_real ?? 0), 0);
  const promedio = team.rendimientos.length > 0
    ? team.rendimientos.reduce((a, b) => a + b, 0) / team.rendimientos.length
    : null;
  return { sumaPlan, sumaReal, promedio };
}

function rowDataFromItem(item: RendimientoDetailItem): (string | number)[] {
  return COLUMNS.map((col) => {
    const val: unknown = item[col.key];
    if (col.key === "inicio_planificado" || col.key === "final_planificado" || col.key === "inicio_real" || col.key === "final_real") {
      return formatTimeHHMM(val == null ? null : String(val));
    }
    if (col.key === "rendimiento" && val != null) {
      return `${Number(val).toFixed(2)}%`;
    }
    if (col.key === "tiempo_planificado" || col.key === "tiempo_real") {
      return val == null ? "" : Math.round(Number(val)).toString();
    }
    if (val == null) return "";
    return typeof val === "number" || typeof val === "string" ? val : String(val);
  });
}

function applyRowStyle(row: Row, colNumber: number) {
  const rendimientoCol = COLUMN_NUMBER.rendimiento;
  if (colNumber === rendimientoCol) {
    const perfText = row.getCell(rendimientoCol).value?.toString() ?? "";
    const perfValue = parseFloat(perfText.replace("%", ""));
    if (!isNaN(perfValue)) {
      const isPoor = perfValue < 60;
      row.getCell(rendimientoCol).font = { color: { argb: isPoor ? "FFFF0000" : "FF107C10" }, bold: true };
    }
  }
  if (colNumber === COLUMN_NUMBER.cantidad_planificada || colNumber === COLUMN_NUMBER.cantidad_real) {
    row.getCell(colNumber).font = { color: { argb: "FF8B4513" }, bold: true };
  }
  if (colNumber === COLUMN_NUMBER.tiempo_planificado || colNumber === COLUMN_NUMBER.tiempo_real) {
    row.getCell(colNumber).font = { bold: true, color: { argb: "FF2E5984" } };
  }
}

async function downloadRendimientoExcel(
  detail: RendimientoDetailItem[],
  _stats: RendimientoStats,
  date: string,
  teamFilter: string
) {
  const workbook = await createWorkbook();
  const ws = workbook.addWorksheet("Rendimiento");

  const headers = COLUMNS.map((c) => c.header);
  const headerLabel = teamFilter !== "Todos" ? teamFilter : "Todos los equipos";

  // ── Header del reporte ──
  const titleRow = ws.addRow([]);
  titleRow.height = 30;
  const titleCell = titleRow.getCell(1);
  titleCell.value = `${headerLabel} | ${formatShortDate(date)}`;
  titleCell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
  });
  ws.mergeCells(1, 1, 1, headers.length);

  // ── Header de tabla ──
  const tableHeaderRow = ws.addRow(headers);
  tableHeaderRow.height = 20;
  tableHeaderRow.font = { bold: true };
  tableHeaderRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
  });

  // ── Agrupar por equipo ──
  const groups = groupByTeam(detail);

  let totalPlanGlobal = 0;
  let totalRealGlobal = 0;
  const allRends: number[] = [];

  for (const group of groups) {
    const { sumaPlan, sumaReal, promedio } = computeTeamStats(group);
    totalPlanGlobal += sumaPlan;
    totalRealGlobal += sumaReal;
    if (promedio !== null) allRends.push(promedio);

    // ── Fila de encabezado de equipo ──
    const progress = group.total > 0 ? Math.round(group.completadas / group.total * 100) : 0;
    const headerText = `${group.equipo} — ${group.completadas}/${group.total} tareas  |  Rend. Prom: ${promedio !== null ? promedio.toFixed(1) + "%" : ""}  |  Progreso: ${progress}%`;
    const teamHeaderRow = ws.addRow([headerText]);
    teamHeaderRow.height = 24;
    ws.mergeCells(teamHeaderRow.number, 1, teamHeaderRow.number, headers.length);
    teamHeaderRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2EFDA" } };
      cell.font = { bold: true, size: 11, color: { argb: "FF1A5276" } };
      cell.alignment = { horizontal: "left", vertical: "middle" };
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });

    // ── Filas de tareas del equipo ──
    group.tasks.forEach((item) => {
      const rowData = rowDataFromItem(item);
      const dataRow = ws.addRow(rowData);
      dataRow.eachCell((cell) => {
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      });
      dataRow.eachCell((_, colNumber) => applyRowStyle(dataRow, colNumber));
    });

    // ── Fila de resumen del equipo ──
    const teamSummaryData = COLUMNS.map((col) => {
      switch (col.key) {
        case "tiempo_planificado": return Math.round(sumaPlan).toString();
        case "tiempo_real": return Math.round(sumaReal).toString();
        case "rendimiento": return promedio !== null ? `${promedio.toFixed(2)}%` : "";
        case "equipo": return `Subtotal ${group.equipo}`;
        default: return "";
      }
    });
    const teamSummaryRow = ws.addRow(teamSummaryData);
    teamSummaryRow.eachCell((cell, colNumber) => {
      cell.border = { top: { style: "medium" }, left: { style: "thin" }, bottom: { style: "medium" }, right: { style: "thin" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F8F5" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.font = { bold: true, size: 10 };
      if (colNumber === COLUMN_NUMBER.rendimiento) cell.font = { bold: true, color: { argb: "FF1A5276" } };
    });
  }

  // ── Fila de resumen global ──
  const avgRendGlobal = allRends.length > 0
    ? allRends.reduce((a, b) => a + b, 0) / allRends.length
    : 0;
  const globalSummaryData = COLUMNS.map((col) => {
    switch (col.key) {
      case "tiempo_planificado": return Math.round(totalPlanGlobal).toString();
      case "tiempo_real": return Math.round(totalRealGlobal).toString();
      case "rendimiento": return `${avgRendGlobal.toFixed(2)}%`;
      case "equipo": return "TOTAL GENERAL:";
      default: return "";
    }
  });
  const globalSummaryRow = ws.addRow(globalSummaryData);
  globalSummaryRow.eachCell((cell, colNumber) => {
    cell.border = { top: { style: "medium" }, left: { style: "thin" }, bottom: { style: "medium" }, right: { style: "thin" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF2CC" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.font = { bold: true, size: 11 };
    if (colNumber === COLUMN_NUMBER.rendimiento) cell.font = { bold: true, color: { argb: "FF2E5984" } };
  });

  // Ancho de columnas
  COLUMNS.forEach((col, i) => {
    ws.getColumn(i + 1).width = col.width;
  });

  // ── Descargar ──
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const dateStr = date.replace(/-/g, "_");
  link.download = `Rendimiento_${headerLabel.replace(/\s+/g, "_")}_${dateStr}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
}

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const MONTHLY_COLUMNS = [
  { header: "Equipo", key: "equipo", width: 25 },
  { header: "Días con datos", key: "dias_con_datos", width: 15 },
  { header: "Tareas Totales", key: "tareas_totales", width: 15 },
  { header: "Tareas Completadas", key: "tareas_completadas", width: 18 },
  { header: "Rendimiento Prom.", key: "rendimiento_promedio", width: 18 },
  { header: "Progreso", key: "progreso", width: 12 },
] as const;

const DAY_COLUMNS = [
  { header: "  Fecha", key: "date", width: 20 },
  { header: "  Tareas Totales", key: "tareas_totales", width: 18 },
  { header: "  Tareas Comp.", key: "tareas_completadas", width: 16 },
  { header: "  Rendimiento", key: "rendimiento", width: 18 },
] as const;

type MonthlyColumnKey = (typeof MONTHLY_COLUMNS)[number]["key"];
type DayColumnKey = (typeof DAY_COLUMNS)[number]["key"];

const MONTHLY_COLUMN_NUMBER = Object.fromEntries(
  MONTHLY_COLUMNS.map((column, index) => [column.key, index + 1])
) as Record<MonthlyColumnKey, number>;

const DAY_COLUMN_NUMBER = Object.fromEntries(
  DAY_COLUMNS.map((column, index) => [column.key, index + 1])
) as Record<DayColumnKey, number>;

async function downloadRendimientoMensualExcel(
  monthlyData: RendimientoMensualResponse,
  year: number,
  month: number
) {
  const workbook = await createWorkbook();
  const ws = workbook.addWorksheet("Rendimiento Mensual");

  const monthName = MONTHS_ES[month - 1];
  const title = `Rendimiento Mensual - ${monthName} ${year}`;

  const headers = MONTHLY_COLUMNS;

  // Title row
  const titleRow = ws.addRow([]);
  titleRow.height = 30;
  const titleCell = titleRow.getCell(1);
  titleCell.value = title;
  titleCell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
  });
  ws.mergeCells(1, 1, 1, headers.length);

  // Stats row
  const statsRow = ws.addRow([]);
  statsRow.height = 22;
  const statsCell = statsRow.getCell(1);
  statsCell.value = `Equipos: ${monthlyData.stats.equipos}  |  Eficiencia Prom: ${monthlyData.stats.eficiencia_promedio}%  |  Tareas: ${monthlyData.stats.tareas_completadas}/${monthlyData.stats.tareas_totales}`;
  statsCell.font = { bold: true, size: 10, color: { argb: "FF1A5276" } };
  statsCell.alignment = { horizontal: "left", vertical: "middle" };
  statsRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2EFDA" } };
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
  });
  ws.mergeCells(2, 1, 2, headers.length);

  // Table header
  const tableHeaderRow = ws.addRow(headers.map((c) => c.header));
  tableHeaderRow.height = 20;
  tableHeaderRow.font = { bold: true };
  tableHeaderRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
  });

  // Team rows
  for (const team of monthlyData.teams) {
    const rendColor = team.rendimiento_promedio !== null
      ? (team.rendimiento_promedio >= 85 ? "FF107C10" : team.rendimiento_promedio >= 60 ? "FFED7D31" : "FFFF0000")
      : "FF6B6B6B";

    const rowData = MONTHLY_COLUMNS.map((col) => {
      switch (col.key) {
        case "equipo": return team.equipo;
        case "dias_con_datos": return team.dias_con_datos;
        case "tareas_totales": return team.tareas_totales;
        case "tareas_completadas": return team.tareas_completadas;
        case "rendimiento_promedio": return team.rendimiento_promedio !== null ? `${team.rendimiento_promedio.toFixed(1)}%` : "";
        case "progreso": return `${team.progreso}%`;
      }
    });

    const dataRow = ws.addRow(rowData);
    dataRow.eachCell((cell, colNumber) => {
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      if (colNumber === MONTHLY_COLUMN_NUMBER.rendimiento_promedio) {
        cell.font = { bold: true, color: { argb: rendColor } };
      }
      if (colNumber === MONTHLY_COLUMN_NUMBER.progreso) {
        cell.font = { bold: true, color: { argb: "FF2E5984" } };
      }
    });

    // Detail days rows
    if (team.dias.length > 0) {
      const dayHeaderRow = ws.addRow(DAY_COLUMNS.map((c) => c.header));
      dayHeaderRow.height = 18;
      dayHeaderRow.font = { bold: true, size: 10, color: { argb: "FF4472C4" } };
      dayHeaderRow.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      });

      for (const dia of team.dias) {
        const dRendColor = dia.rendimiento !== null
          ? (dia.rendimiento >= 85 ? "FF107C10" : dia.rendimiento >= 60 ? "FFED7D31" : "FFFF0000")
          : "FF6B6B6B";

        const dayRowData = DAY_COLUMNS.map((col) => {
          switch (col.key) {
            case "date": return formatShortDate(dia.date);
            case "tareas_totales": return dia.tareas_totales;
            case "tareas_completadas": return dia.tareas_completadas;
            case "rendimiento": return dia.rendimiento !== null ? `${dia.rendimiento.toFixed(2)}%` : "";
          }
        });
        const dayRow = ws.addRow(dayRowData);
        dayRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          if (colNumber === DAY_COLUMN_NUMBER.rendimiento) {
            cell.font = { bold: true, color: { argb: dRendColor } };
          }
        });
      }
    }
  }

  // Global summary
  const totalEquipos = monthlyData.teams.length;

  // Días reales del mes con datos: días únicos (no la suma de los días de cada equipo,
  // que multiplicaba el conteo cuando varios equipos trabajaban el mismo día).
  const diasUnicos = new Set(
    monthlyData.teams.flatMap((t) => t.dias.map((d) => d.date))
  );
  const totalDias = diasUnicos.size;

  const totalTareas = monthlyData.stats.tareas_totales != null
    ? Number(monthlyData.stats.tareas_totales)
    : monthlyData.teams.reduce((s, t) => s + t.tareas_totales, 0);
  const totalCompletadas = monthlyData.stats.tareas_completadas != null
    ? Number(monthlyData.stats.tareas_completadas)
    : monthlyData.teams.reduce((s, t) => s + t.tareas_completadas, 0);

  // Rendimiento promedio de TODOS los equipos en el mes: promedio de los rendimientos
  // diarios de todos los equipos (no el promedio de los promedios por equipo, que
  // daba distinto según cuántos días hubiera trabajado cada uno).
  const rendimientosDiarios = monthlyData.teams.flatMap((t) =>
    t.dias.filter((d) => d.rendimiento !== null).map((d) => d.rendimiento!)
  );
  const promedioGlobal = rendimientosDiarios.length > 0
    ? rendimientosDiarios.reduce((a, b) => a + b, 0) / rendimientosDiarios.length
    : 0;

  const progresoGlobal = totalTareas > 0 ? Math.round((totalCompletadas / totalTareas) * 100) : 0;

  const summaryRow = ws.addRow([]);
  summaryRow.height = 22;
  const summaryCell = summaryRow.getCell(1);
  summaryCell.value = `TOTAL GENERAL: ${totalEquipos} equipos  |  ${totalDias} días  |  ${totalCompletadas}/${totalTareas} tareas  |  Rend. Prom: ${promedioGlobal.toFixed(1)}%  |  Progreso: ${progresoGlobal}%`;
  summaryCell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
  summaryCell.alignment = { horizontal: "left", vertical: "middle" };
  summaryRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
    cell.border = { top: { style: "medium" }, left: { style: "thin" }, bottom: { style: "medium" }, right: { style: "thin" } };
  });
  ws.mergeCells(summaryRow.number, 1, summaryRow.number, headers.length);

  // Column widths
  headers.forEach((col, i) => {
    ws.getColumn(i + 1).width = col.width;
  });

  // Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Rendimiento_Mensual_${monthName}_${year}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
}

export const rendimientoService = {
  async getRendimiento(date: string, team_id?: string | null): Promise<RendimientoResponse> {
    const params = new URLSearchParams({ date });

    if (team_id) {
      params.append("team_id", team_id);
    }

    const url = `${REPORTS_API_URL}/api/v1/reports/rendimiento?${params}`;

    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error("Failed to fetch rendimiento data");
    }

    return response.json();
  },

  async getRendimientoMensual(year: number, month: number): Promise<RendimientoMensualResponse> {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    const url = `${REPORTS_API_URL}/api/v1/reports/rendimiento/mensual?${params}`;
    const response = await fetchWithAuth(url);
    if (!response.ok) {
      throw new Error("Failed to fetch monthly rendimiento data");
    }
    const raw: RendimientoMensualRawResponse = await response.json();

    const grouped: Record<string, TeamMonthly> = {};
    for (const row of raw.teams) {
      const key = row.team_id;
      if (!grouped[key]) {
        grouped[key] = {
          equipo: row.equipo,
          team_id: row.team_id,
          dias: [],
          dias_con_datos: 0,
          rendimiento_promedio: null,
          tareas_totales: 0,
          tareas_completadas: 0,
          progreso: 0,
        };
      }
      const team = grouped[key];
      team.dias.push({
        date: row.date,
        rendimiento: row.rendimiento != null ? Number(row.rendimiento) : null,
        tareas_totales: Number(row.tareas_totales),
        tareas_completadas: Number(row.tareas_completadas),
      });
      team.tareas_totales += Number(row.tareas_totales);
      team.tareas_completadas += Number(row.tareas_completadas);
    }

    for (const team of Object.values(grouped)) {
      team.dias_con_datos = team.dias.length;
      const rends = team.dias.filter((d) => d.rendimiento != null).map((d) => d.rendimiento!);
      team.rendimiento_promedio = rends.length > 0
        ? Math.round(rends.reduce((a, b) => a + b, 0) / rends.length * 10) / 10
        : null;
      team.progreso = team.tareas_totales > 0
        ? Math.round((team.tareas_completadas / team.tareas_totales) * 100)
        : 0;
    }

    return {
      stats: raw.stats,
      teams: Object.values(grouped),
    };
  },

  downloadExcel: downloadRendimientoExcel,
  downloadExcelMensual: downloadRendimientoMensualExcel,
};

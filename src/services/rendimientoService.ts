import ExcelJS from "exceljs";
import { REPORTS_API_URL, fetchWithAuth } from "../config/api";

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
  [key: string]: any;
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
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-";
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
];

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
    const val = item[col.key];
    if (col.key === "inicio_planificado" || col.key === "final_planificado" || col.key === "inicio_real" || col.key === "final_real") {
      return formatTimeHHMM(val as string | null);
    }
    if (col.key === "rendimiento" && val != null) {
      return `${Number(val).toFixed(2)}%`;
    }
    if ((col.key === "tiempo_planificado" || col.key === "tiempo_real") && val != null) {
      return Math.round(Number(val)).toString();
    }
    if ((col.key === "cantidad_planificada" || col.key === "cantidad_real") && (val === null || val === undefined)) {
      return "-";
    }
    if (val === null || val === undefined) return "-";
    return val;
  });
}

function applyRowStyle(row: any, colNumber: number) {
  if (colNumber === 14) {
    const perfText = row.getCell(14).value ? row.getCell(14).value.toString() : "";
    const perfValue = parseFloat(perfText.replace("%", ""));
    if (!isNaN(perfValue)) {
      const isPoor = perfValue < 60;
      row.getCell(14).font = { color: { argb: isPoor ? "FFFF0000" : "FF107C10" }, bold: true };
    }
  }
  if (colNumber === 6 || colNumber === 7) {
    row.getCell(colNumber).font = { color: { argb: "FF8B4513" }, bold: true };
  }
  if (colNumber === 10 || colNumber === 13) {
    row.getCell(colNumber).font = { bold: true, color: { argb: "FF2E5984" } };
  }
}

async function downloadRendimientoExcel(
  detail: RendimientoDetailItem[],
  _stats: RendimientoStats,
  date: string,
  teamFilter: string
) {
  const workbook = new ExcelJS.Workbook();
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
    const headerText = `${group.equipo} — ${group.completadas}/${group.total} tareas  |  Rend. Prom: ${promedio !== null ? promedio.toFixed(1) + "%" : "N/A"}  |  Progreso: ${progress}%`;
    const teamHeaderRow = ws.addRow([headerText]);
    teamHeaderRow.height = 24;
    ws.mergeCells(teamHeaderRow.number, 1, teamHeaderRow.number, headers.length);
    teamHeaderRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD6EAF8" } };
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
    const teamSummaryData: (string | number)[] = [];
    for (let c = 0; c < COLUMNS.length; c++) {
      if (c === 9) teamSummaryData.push(Math.round(sumaPlan).toString());
      else if (c === 12) teamSummaryData.push(Math.round(sumaReal).toString());
      else if (c === 13) teamSummaryData.push(promedio !== null ? `${promedio.toFixed(2)}%` : "N/A");
      else teamSummaryData.push(c === 0 ? `Subtotal ${group.equipo}` : "");
    }
    const teamSummaryRow = ws.addRow(teamSummaryData);
    teamSummaryRow.eachCell((cell, colNumber) => {
      cell.border = { top: { style: "medium" }, left: { style: "thin" }, bottom: { style: "medium" }, right: { style: "thin" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F8F5" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.font = { bold: true, size: 10 };
      if (colNumber === 14) cell.font = { bold: true, color: { argb: "FF1A5276" } };
    });
  }

  // ── Fila de resumen global ──
  const avgRendGlobal = allRends.length > 0
    ? allRends.reduce((a, b) => a + b, 0) / allRends.length
    : 0;
  const globalSummaryData: (string | number)[] = [];
  for (let c = 0; c < COLUMNS.length; c++) {
    if (c === 9) globalSummaryData.push(Math.round(totalPlanGlobal).toString());
    else if (c === 12) globalSummaryData.push(Math.round(totalRealGlobal).toString());
    else if (c === 13) globalSummaryData.push(`${avgRendGlobal.toFixed(2)}%`);
    else globalSummaryData.push(c === 0 ? "TOTAL GENERAL:" : "");
  }
  const globalSummaryRow = ws.addRow(globalSummaryData);
  globalSummaryRow.eachCell((cell, colNumber) => {
    cell.border = { top: { style: "medium" }, left: { style: "thin" }, bottom: { style: "medium" }, right: { style: "thin" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF2CC" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.font = { bold: true, size: 11 };
    if (colNumber === 14) cell.font = { bold: true, color: { argb: "FF2E5984" } };
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
    return response.json();
  },

  downloadExcel: downloadRendimientoExcel,
};

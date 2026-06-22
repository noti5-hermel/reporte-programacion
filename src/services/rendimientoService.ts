import ExcelJS from "exceljs";
import { REPORTS_API_URL } from "../config/api";

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

async function downloadRendimientoExcel(
  detail: RendimientoDetailItem[],
  stats: RendimientoStats,
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

  // ── Filas de datos ──
  detail.forEach((item) => {
    const rowData = COLUMNS.map((col) => {
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

    const dataRow = ws.addRow(rowData);
    dataRow.eachCell((cell, colNumber) => {
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      cell.alignment = {
        horizontal: colNumber === 2 ? "left" : "center",
        vertical: "middle",
        wrapText: true,
      };

      // Colorear rendimiento (columna 14)
      if (colNumber === 14) {
        const perfText = cell.value ? cell.value.toString() : "";
        const perfValue = parseFloat(perfText.replace("%", ""));
        if (!isNaN(perfValue)) {
          const isPoor = perfValue < 60;
          cell.font = { color: { argb: isPoor ? "FFFF0000" : "FF107C10" }, bold: true };
        }
      }

      // Cantidades en marrón
      if (colNumber === 6 || colNumber === 7) {
        cell.font = { color: { argb: "FF8B4513" }, bold: true };
      }

      // Tiempos en azul
      if (colNumber === 10 || colNumber === 13) {
        cell.font = { bold: true, color: { argb: "FF2E5984" } };
      }
    });
  });

  // ── Fila de resumen ──
  const totalTiempoPlan = detail.reduce((s, i) => s + (i.tiempo_planificado ?? 0), 0);
  const totalTiempoReal = detail.reduce((s, i) => s + (i.tiempo_real ?? 0), 0);
  const tasksWithRend = detail.filter((i) => i.rendimiento != null);
  const avgRend = tasksWithRend.length > 0
    ? tasksWithRend.reduce((s, i) => s + (i.rendimiento ?? 0), 0) / tasksWithRend.length
    : 0;

  const summaryData: (string | number)[] = [];
  for (let c = 0; c < COLUMNS.length; c++) {
    if (c === 9) summaryData.push(Math.round(totalTiempoPlan).toString());
    else if (c === 12) summaryData.push(Math.round(totalTiempoReal).toString());
    else if (c === 13) summaryData.push(`${avgRend.toFixed(2)}%`);
    else summaryData.push(c === 0 ? "TOTAL:" : "");
  }

  const summaryRow = ws.addRow(summaryData);
  summaryRow.eachCell((cell, colNumber) => {
    cell.border = { top: { style: "medium" }, left: { style: "thin" }, bottom: { style: "medium" }, right: { style: "thin" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF2CC" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.font = { bold: true };
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
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({ date });

    if (team_id) {
      params.append("team_id", team_id);
    }

    const url = `${REPORTS_API_URL}/api/v1/reports/rendimiento?${params}`;

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch rendimiento data");
    }

    return response.json();
  },
  downloadExcel: downloadRendimientoExcel,
};

import { REPORTS_API_URL, fetchWithAuth } from "../config/api";

export interface CompletedTaskItem {
  codigo: string;
  descripcion: string;
  lote: string;
  actividad: string;
  produccion: number | null;
  personas: number | null;
  fecha: string;
  cantidad: number | null;
  duracion: number | null;
  horas: number | null;
  [key: string]: any;
}

export interface PaginatedResponse {
  data: CompletedTaskItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const completedTasksService = {
  async getCompletedTasks(
    page: number = 1,
    pageSize: number = 50,
    startDate?: string,
    endDate?: string
  ): Promise<PaginatedResponse> {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("page_size", String(pageSize));
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);

    const response = await fetchWithAuth(
      `${REPORTS_API_URL}/api/v1/reports/completed-tasks?${params}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch completed tasks data");
    }

    return response.json();
  },
};

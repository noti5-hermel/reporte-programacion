import { REPORTS_API_URL } from "../config/api";

export interface TaskPerformanceItem {
  fecha: string;
  code: string;
  description: string;
  lote: string;
  type: string;
  activity: string;
  horas: number | null;
  real_quantity: number;
  real_minutes: number;
  real_start_time: string;
  real_end_time: string;
  people: number;
  total_horas: number | null;
  proporcion: number | null;
  [key: string]: any;
}

export const taskPerformanceService = {
  async getTaskPerformance(): Promise<TaskPerformanceItem[]> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${REPORTS_API_URL}/api/v1/reports/task-performance`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch task performance data");
    }

    return response.json();
  },
};

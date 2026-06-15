import { API_BASE_URL } from "../config/api";

export interface TaskPerformanceGroupItem {
  code: string;
  description: string;
  type: string;
  sum_hours: number | null;
  sum_quantity: number | null;
  avg_time_per_product: number | null;
  people: number;
  final_metric: number | null;
  [key: string]: any;
}

export const productivityService = {
  async getTaskPerformanceGroup(year?: number | null, month?: number | null): Promise<TaskPerformanceGroupItem[]> {
    const token = localStorage.getItem("token");
    let url = `${API_BASE_URL}/api/v1/reports/task-performance-group`;
    
    const params = new URLSearchParams();
    if (year !== undefined && year !== null) {
      params.append("year", year.toString());
    }
    if (month !== undefined && month !== null) {
      params.append("month", month.toString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch task performance group data");
    }

    return response.json();
  },
};

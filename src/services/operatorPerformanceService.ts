import { REPORTS_API_URL, fetchWithAuth } from "../config/api";

export interface OperatorPerformanceItem {
  operator_id: string;
  username: string;
  operator_name: string | null;
  job_title: string | null;
  completed_tasks: number;
  total_tasks: number;
  total_real_minutes: number;
  total_real_quantity: number;
  avg_planned_performance: number | null;
  avg_planned_minutes: number | null;
  avg_planned_people: number | null;
  active_days: number;
  team_count: number;
  teams: string | null;
  real_productivity: number | null;
  completion_rate: number;
  [key: string]: any;
}

export const operatorPerformanceService = {
  async getOperatorPerformance(start_date: string, end_date: string): Promise<OperatorPerformanceItem[]> {
    const params = new URLSearchParams({ start_date, end_date });
    const url = `${REPORTS_API_URL}/api/v1/reports/operator-performance?${params}`;

    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error("Failed to fetch operator performance data");
    }

    return response.json();
  },
};

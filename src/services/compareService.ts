import { API_BASE_URL, fetchWithAuth } from "../config/api";

export interface CompareRecord {
  code: string;
  description: string;
  tipo: string;
  tiempo: number;
  total_tiempo_real: number;
  diferencia: number;
  compare_date: string;
  numero_personas: number;
  [key: string]: any;
}

export interface HistoricoFecha {
  id?: string;
  fecha: string;
}

export const compareService = {
  async getCompareRecords(compareDate?: string): Promise<CompareRecord[]> {
    let url = `${API_BASE_URL}/api/v1/reports/compare/`;
    if (compareDate) {
      url += `?compareDate=${encodeURIComponent(compareDate)}`;
    }

    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error("Failed to fetch comparison records");
    }

    return response.json();
  },

  async getHistoricoFechas(): Promise<HistoricoFecha[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/reports/historico-comparacion-fechas/`);

    if (!response.ok) {
      throw new Error("Failed to fetch historical dates");
    }

    return response.json();
  },

  async createCompareRecords(items: any[]): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/reports/compare/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || response.statusText);
    }

    return response.json();
  },

  async createHistoricoFecha(fecha: string): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/reports/historico-comparacion-fechas/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha }),
    });

    if (!response.ok) {
      throw new Error("Failed to create historical date");
    }

    return response.json();
  },
};

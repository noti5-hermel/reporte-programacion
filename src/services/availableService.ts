import { API_BASE_URL, fetchWithAuth } from "../config/api";

export interface AvailableItem {
  id?: string;
  codigo: string;
  description: string;
  disponible: number;
  minimo: number;
  reorder: number;
  dias_disponibles: number;
  date_upload?: string | null;
  [key: string]: any;
}

export const availableService = {
  async getAvailableItems(skip = 0, limit = 100): Promise<AvailableItem[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/available/?skip=${skip}&limit=${limit}`);

    if (!response.ok) {
      throw new Error("Failed to fetch available items");
    }

    return response.json();
  },

  async createAvailableItems(items: AvailableItem[]): Promise<AvailableItem[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/available/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error inserting new available items");
    }

    return response.json();
  },

  async deleteAllAvailableItems(): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/available/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error("Failed to delete available items");
    }

    return response.json();
  },
};

import { REPORTS_API_URL, fetchWithAuth } from "../config/api";

export interface UserItem {
  id: string;
  username: string;
  full_name: string | null;
  role: string;
}

export interface PermissionResponse {
  user_id: string;
  reports: string[];
}

export const permissionService = {
  async getUsers(): Promise<UserItem[]> {
    const res = await fetchWithAuth(`${REPORTS_API_URL}/api/v1/reports/admin/users`);
    if (!res.ok) throw new Error("Error al obtener usuarios");
    return res.json();
  },

  async getMyPermissions(): Promise<PermissionResponse> {
    const res = await fetchWithAuth(`${REPORTS_API_URL}/api/v1/reports/admin/permissions/me`);
    if (!res.ok) throw new Error("Error al obtener permisos");
    return res.json();
  },

  async getPermissions(userId: string): Promise<PermissionResponse> {
    const res = await fetchWithAuth(`${REPORTS_API_URL}/api/v1/reports/admin/permissions/${userId}`);
    if (!res.ok) throw new Error("Error al obtener permisos");
    return res.json();
  },

  async setPermissions(userId: string, reports: string[]): Promise<PermissionResponse> {
    const res = await fetchWithAuth(`${REPORTS_API_URL}/api/v1/reports/admin/permissions/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reports }),
    });
    if (!res.ok) throw new Error("Error al actualizar permisos");
    return res.json();
  },
};

export const REPORT_OPTIONS = [
  { key: "general", label: "Tabla General" },
  { key: "rendimiento", label: "Rendimiento" },
  { key: "resumen", label: "Tabla Resumida" },
  { key: "comparacion", label: "Comparación" },
  { key: "formato", label: "Formato" },
  { key: "disponibilidad", label: "Disponibilidad" },
] as const;

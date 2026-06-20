import { REPORTS_API_URL } from "../config/api";

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

const getToken = () => localStorage.getItem("token");

export const permissionService = {
  async getUsers(): Promise<UserItem[]> {
    const token = getToken();
    const res = await fetch(`${REPORTS_API_URL}/api/v1/reports/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al obtener usuarios");
    return res.json();
  },

  async getMyPermissions(): Promise<PermissionResponse> {
    const token = getToken();
    const res = await fetch(
      `${REPORTS_API_URL}/api/v1/reports/admin/permissions/me`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error("Error al obtener permisos");
    return res.json();
  },

  async getPermissions(userId: string): Promise<PermissionResponse> {
    const token = getToken();
    const res = await fetch(
      `${REPORTS_API_URL}/api/v1/reports/admin/permissions/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error("Error al obtener permisos");
    return res.json();
  },

  async setPermissions(userId: string, reports: string[]): Promise<PermissionResponse> {
    const token = getToken();
    const res = await fetch(
      `${REPORTS_API_URL}/api/v1/reports/admin/permissions/${userId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reports }),
      }
    );
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

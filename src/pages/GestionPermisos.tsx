import { useState, useEffect } from "react";
import { Shield, Save } from "lucide-react";
import { permissionService, REPORT_OPTIONS } from "../services/permissionService";
import type { UserItem } from "../services/permissionService";
import { useAuth } from "../hooks/useAuth";

export default function GestionPermisos() {
  useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [userReports, setUserReports] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const userList = await permissionService.getUsers();
      setUsers(userList);

      const reportsMap: Record<string, Set<string>> = {};
      await Promise.all(
        userList.map(async (u) => {
          try {
            const resp = await permissionService.getPermissions(u.id);
            reportsMap[u.id] = new Set(resp.reports);
          } catch {
            reportsMap[u.id] = new Set();
          }
        })
      );
      setUserReports(reportsMap);
    } catch (err) {
      setMessage({ type: "error", text: "Error al cargar datos" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleReport = (userId: string, report: string, checked: boolean) => {
    setUserReports((prev) => {
      const next = { ...prev };
      const set = new Set(next[userId] || []);
      if (checked) set.add(report);
      else set.delete(report);
      next[userId] = set;
      return next;
    });
  };

  const saveUser = async (userId: string) => {
    setSaving(userId);
    setMessage(null);
    try {
      const reports = Array.from(userReports[userId] || []);
      await permissionService.setPermissions(userId, reports);
      setMessage({ type: "success", text: "Permisos guardados correctamente" });
    } catch {
      setMessage({ type: "error", text: "Error al guardar permisos" });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-button-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-background-secondary border border-border-card rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-4">
        <div className="bg-icon-bg p-3 rounded-xl text-button-primary">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-title">Gestión de Permisos</h1>
          <p className="text-subtitle text-sm">
            Administra qué reportes puede ver cada usuario
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-sm font-bold ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-background-secondary rounded-2xl border border-border-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background-primary border-b border-border-card">
                <th className="text-left px-4 py-3 font-bold text-subtitle text-xs uppercase tracking-wider">Usuario</th>
                <th className="text-left px-4 py-3 font-bold text-subtitle text-xs uppercase tracking-wider">Rol</th>
                {REPORT_OPTIONS.map((opt) => (
                  <th key={opt.key} className="text-center px-3 py-3 font-bold text-subtitle text-xs uppercase tracking-wider whitespace-nowrap">
                    {opt.label}
                  </th>
                ))}
                <th className="text-center px-4 py-3 font-bold text-subtitle text-xs uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={REPORT_OPTIONS.length + 3} className="text-center py-8 text-subtitle">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
              {users.map((u) => {
                const isAdmin = u.role === "ADMIN";
                const reports = userReports[u.id] || new Set();
                const isSaving = saving === u.id;

                return (
                  <tr key={u.id} className="border-b border-border-card hover:bg-background-primary transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-title">{u.full_name || u.username}</div>
                      <div className="text-xs text-subtitle">{u.username}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold ${
                        isAdmin
                          ? "bg-purple-100 text-purple-700"
                          : "bg-background-primary text-subtitle"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    {REPORT_OPTIONS.map((opt) => (
                      <td key={opt.key} className="text-center px-3 py-3">
                        <input
                          type="checkbox"
                          checked={isAdmin || reports.has(opt.key)}
                          disabled={isAdmin}
                          onChange={(e) => toggleReport(u.id, opt.key, e.target.checked)}
                          className="w-4 h-4 rounded border-border-card text-button-primary focus:ring-button-primary/20 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </td>
                    ))}
                    <td className="text-center px-4 py-3">
                      <button
                        onClick={() => saveUser(u.id)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 bg-button-primary hover:bg-button-primary-hover disabled:bg-background-primary disabled:text-subtitle text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-btn-glow hover:shadow-btn-glow-hover"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {isSaving ? "Guardando..." : "Guardar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

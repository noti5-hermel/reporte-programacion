import { useState, useEffect } from "react";
import { Shield, Save } from "lucide-react";
import { permissionService, REPORT_OPTIONS } from "../services/permissionService";
import type { UserItem } from "../services/permissionService";
import { useAuth } from "../hooks/useAuth";

export default function GestionPermisos() {
  const { user } = useAuth();
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
      <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Permisos</h1>
          <p className="text-slate-500 text-sm">
            Administra qué reportes puede ver cada usuario
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg border text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Usuario</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Rol</th>
                {REPORT_OPTIONS.map((opt) => (
                  <th key={opt.key} className="text-center px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">
                    {opt.label}
                  </th>
                ))}
                <th className="text-center px-4 py-3 font-semibold text-slate-700">Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={REPORT_OPTIONS.length + 3} className="text-center py-8 text-slate-400">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
              {users.map((u) => {
                const isAdmin = u.role === "ADMIN";
                const reports = userReports[u.id] || new Set();
                const isSaving = saving === u.id;

                return (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{u.full_name || u.username}</div>
                      <div className="text-xs text-slate-400">{u.username}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        isAdmin
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100 text-slate-600"
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
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </td>
                    ))}
                    <td className="text-center px-4 py-3">
                      <button
                        onClick={() => saveUser(u.id)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
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

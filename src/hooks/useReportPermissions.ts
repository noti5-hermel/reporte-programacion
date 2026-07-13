import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { permissionService, REPORT_OPTIONS } from "../services/permissionService";

export function useReportPermissions() {
  const { user } = useAuth();
  const [allowed, setAllowed] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!user?.username) return;

    if (user.role === "ADMIN") {
      setAllowed(new Set(REPORT_OPTIONS.map((r) => r.key)));
      return;
    }

    const cached = localStorage.getItem("user_reports");

    permissionService
      .getMyPermissions()
      .then((res) => {
        const reports = new Set(res.reports);
        setAllowed(reports);
        localStorage.setItem("user_reports", JSON.stringify([...reports]));
      })
      .catch(() => {
        if (cached) {
          try {
            setAllowed(new Set(JSON.parse(cached)));
            return;
          } catch {}
        }
        setAllowed(new Set());
      });
  }, [user?.username, user?.role]);

  return allowed;
}

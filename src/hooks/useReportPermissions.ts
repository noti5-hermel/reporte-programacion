import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { permissionService, REPORT_OPTIONS } from "../services/permissionService";
import {
  loadReportPermissions,
  peekReportPermissions,
} from "../services/permissionCache";

export function useReportPermissions() {
  const { user } = useAuth();
  const username = user?.username;
  const [allowed, setAllowed] = useState<Set<string> | null>(() =>
    username ? peekReportPermissions(username) : null
  );

  useEffect(() => {
    if (!username) return;

    const cached = peekReportPermissions(username);
    if (cached) {
      setAllowed(cached);
      return;
    }

    let active = true;

    loadReportPermissions(username, async () => {
      if (user?.role === "ADMIN") {
        return new Set(REPORT_OPTIONS.map((r) => r.key));
      }

      const stored = localStorage.getItem("user_reports");
      try {
        const res = await permissionService.getMyPermissions();
        const reports = new Set(res.reports);
        localStorage.setItem("user_reports", JSON.stringify([...reports]));
        return reports;
      } catch {
        if (stored) {
          try {
            return new Set<string>(JSON.parse(stored));
          } catch {
            // localStorage corrupto: se continúa con la lista vacía.
          }
        }
        return new Set<string>();
      }
    })
      .then((reports) => {
        if (active) setAllowed(reports);
      })
      .catch(() => {
        if (active) setAllowed(new Set<string>());
      });

    return () => {
      active = false;
    };
  }, [username, user?.role]);

  return allowed;
}

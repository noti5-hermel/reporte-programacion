const normalizeUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return url;
  return `http://${url}`;
};

// En producción se usan rutas relativas: nginx proxyiza /api/ hacia la API de
// reportes y /auth-api/ hacia el servicio de autenticación. Los valores VITE_*
// permiten apuntar a otros hosts en desarrollo o en despliegues sin proxy.
export const API_BASE_URL = normalizeUrl(import.meta.env.VITE_API_BASE_URL || "");
export const REPORTS_API_URL = normalizeUrl(import.meta.env.VITE_REPORTS_API_URL || API_BASE_URL);
export const AUTH_API_URL = normalizeUrl(import.meta.env.VITE_AUTH_API_URL || "/auth-api");
export const AUTH_HEALTH_URL = normalizeUrl(
  import.meta.env.VITE_AUTH_HEALTH_URL || "/auth-api/api/auth/health"
);
export const AUTH_FRONTEND_URL = normalizeUrl(
  import.meta.env.VITE_AUTH_FRONTEND_URL || window.location.origin
);

async function handleUnauthorized() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("last_activity");
  localStorage.removeItem("user_reports");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(AUTH_HEALTH_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.status === "UP") {
        const returnUrl = encodeURIComponent(window.location.origin + "/");
        window.location.href = `${AUTH_FRONTEND_URL}/login?returnUrl=${returnUrl}`;
        return;
      }
    }
  } catch {
  }

  window.location.href = "/login";
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    await handleUnauthorized();
    throw new Error("Sesión expirada");
  }

  return response;
}

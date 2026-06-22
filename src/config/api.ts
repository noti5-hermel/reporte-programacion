const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://192.168.1.155:8001";
const rawReportsApiUrl = import.meta.env.VITE_REPORTS_API_URL || rawApiBaseUrl;

const normalizeUrl = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `http://${url}`;
};

export const API_BASE_URL = normalizeUrl(rawApiBaseUrl);
export const REPORTS_API_URL = normalizeUrl(rawReportsApiUrl);

const AUTH_HEALTH_URL = import.meta.env.VITE_AUTH_HEALTH_URL || "http://192.168.1.155:8081/api/auth/health";
const AUTH_FRONTEND_URL = import.meta.env.VITE_AUTH_FRONTEND_URL || "http://192.168.1.155:5173";

async function handleUnauthorized() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("last_activity");

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

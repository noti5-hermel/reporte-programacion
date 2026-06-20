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

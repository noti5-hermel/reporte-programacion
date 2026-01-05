// Asegura que la URL base de la API siempre sea una URL absoluta.
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://192.168.1.155:8001";

// Función para normalizar la URL, añadiendo http:// si es necesario.
const normalizeUrl = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Si no tiene protocolo, se lo añadimos por defecto.
  return `http://${url}`;
};

export const API_BASE_URL = normalizeUrl(rawApiBaseUrl);

// Cache compartida de permisos: Sidebar, ReportIndex y las páginas de reporte
// montan el hook por separado. Sin esta cache cada uno lanzaba la misma
// petición `/permissions/me` al iniciar sesión.

type PermissionCache = {
  username: string;
  value: Set<string>;
};

type InFlight = {
  username: string;
  promise: Promise<Set<string>>;
};

let cache: PermissionCache | null = null;
let inFlight: InFlight | null = null;
let generation = 0;

export function peekReportPermissions(username: string): Set<string> | null {
  return cache?.username === username ? cache.value : null;
}

export function loadReportPermissions(
  username: string,
  loader: () => Promise<Set<string>>
): Promise<Set<string>> {
  if (inFlight?.username === username) return inFlight.promise;

  const currentGeneration = generation;
  const promise = loader()
    .then((value) => {
      if (currentGeneration === generation) cache = { username, value };
      if (currentGeneration === generation) inFlight = null;
      return value;
    })
    .catch((error) => {
      if (currentGeneration === generation) inFlight = null;
      throw error;
    });

  inFlight = { username, promise };
  return promise;
}

export function clearReportPermissionsCache(): void {
  generation += 1;
  cache = null;
  inFlight = null;
}

/**
 * Forma de fila que DataTable puede renderizar.
 *
 * Cada pantalla trabaja con su propia interfaz (CompletedTaskItem, ResumenRow,
 * RendimientoDetailItem...). Todas ellas cumplen esta estructura, que es la que
 * usa DataTable para ordenar y TableRow para pintar celdas.
 */
export interface TableRowData {
  [key: string]: unknown;

  // Tabla general
  fecha?: string;
  codigo?: string;
  descripcion?: string;
  tipo?: string;
  lote?: string;
  actividad?: string;
  produccion?: number | null;
  personas?: number | null;
  cantidad?: number | null;
  duracion?: number | null;
  horas?: number | null;
  rendimiento_calculado?: number | null;

  // Tabla resumida
  sumaTotalHoras?: number | null;
  sumCantidad?: number | null;
  promTiempoProducto?: number | null;
  numeroPersonas?: number;
  totalTiempoReal?: number | null;
  rendimiento_sistema?: number | null;

  // Rendimiento
  team?: string;
  equipo?: string;
  description?: string;
  material?: string;
  cantidad_planificada?: number | null;
  cantidad_real?: number | null;
  inicio_planificado?: string | null;
  final_planificado?: string | null;
  tiempo_planificado?: number | null;
  inicio_real?: string | null;
  final_real?: string | null;
  tiempo_real?: number | null;
  rendimiento?: number | null;
  comentarios?: string | null;

  // Operarios
  operator_name?: string | null;
  username?: string;
  job_title?: string | null;
  teams?: string | null;
  active_days?: number;
  completed_tasks?: number;
  total_real_quantity?: number;
  total_real_minutes?: number;
  completion_rate?: number;
  real_productivity?: number | null;
}

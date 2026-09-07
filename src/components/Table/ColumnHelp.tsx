import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";

interface ColumnHelpProps {
  description: string;
}

export function ColumnHelp({ description }: ColumnHelpProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (show && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPos({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, [show]);

  return (
    <span
      ref={iconRef}
      className="relative inline-flex ml-1"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <HelpCircle className="w-3.5 h-3.5 text-subtitle/60 hover:text-button-primary transition-colors cursor-help" />
      {show &&
        createPortal(
          <span
            className="fixed z-[9999] w-56 px-3 py-2 text-xs font-normal text-left normal-case tracking-normal bg-background-secondary text-title border border-border-card rounded-xl shadow-lg pointer-events-none"
            style={{
              top: pos.top,
              left: pos.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            {description}
            <span
              className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-background-secondary"
            />
          </span>,
          document.body
        )}
    </span>
  );
}

export const COLUMN_DESCRIPTIONS: Record<string, Record<string, string>> = {
  general: {
    "Fecha": "Fecha en la que se completó la tarea.",
    "Código": "Código identificador del producto asignado.",
    "Descripción": "Nombre o descripción del producto.",
    "Lote": "Número de lote al que pertenece la tarea.",
    "Actividad": "Tipo de actividad realizada (ej. envasado, sellado).",
    "Producción": "Rendimiento objetivo de la tarea (unidades por hora).",
    "Personas": "Número de personas asignadas a la tarea.",
    "Cantidad": "Cantidad real producida (unidades).",
    "Duración": "Tiempo real de ejecución en minutos.",
    "Horas": "Tiempo real de ejecución convertido a horas.",
    "Rendimiento Calculado": "Unidades producidas por hora = 1 / (horas / cantidad).",
  },
  resumen: {
    "Código": "Código identificador del producto.",
    "Descripción": "Nombre o descripción del producto.",
    "Tipo": "Categoría o tipo de producto.",
    "Suma Total Horas": "Total de horas reales invertidas en todas las tareas de este producto en el período.",
    "Cantidad producida": "Suma total de unidades producidas del producto.",
    "Prom. Tiempo Producto": "Promedio de tiempo real por unidad producida (minutos/unidad).",
    "N° Personas": "Número promedio de personas asignadas.",
    "Total Tiempo Real": "Total de horas reales multiplicado por personas (horas-persona).",
    "Rendimiento Calculado": "Unidades producidas por hora = 1 / (suma horas / suma cantidad).",
  },
  rendimiento: {
    "Equipo": "Equipo o línea de producción.",
    "Código": "Código del producto asignado.",
    "Descripción": "Nombre o descripción del producto.",
    "Material": "Material o materia prima utilizada.",
    "Lote": "Número de lote.",
    "Cant. Plan.": "Cantidad planificada a producir.",
    "Cant. Real": "Cantidad realmente producida.",
    "Inicio Plan": "Fecha y hora de inicio planificada.",
    "Final Plan": "Fecha y hora de finalización planificada.",
    "T. Plan": "Tiempo planificado de ejecución (minutos).",
    "Inicio Real": "Fecha y hora de inicio real.",
    "Final Real": "Fecha y hora de finalización real.",
    "T. Real": "Tiempo real de ejecución (minutos).",
    "Rendimiento": "Porcentaje de eficiencia = (tiempo_planif × cant_planif) / (tiempo_real × cant_real) × 100.",
    "Comentarios": "Observaciones o comentarios registrados durante la ejecución.",
  },
  operators: {
    "Operario": "Nombre del operario.",
    "Cargo": "Rol o cargo del operario.",
    "Equipos": "Equipos a los que pertenece.",
    "Días Activos": "Número de días con al menos una tarea asignada.",
    "Tareas Comp.": "Tareas completadas vs. total asignadas.",
    "Cant. Real": "Cantidad total producida.",
    "T. Real (min)": "Total de minutos reales trabajados.",
    "Eficiencia": "Promedio de rendimiento de las tareas asignadas.",
    "Prod. Real (und/h)": "Productividad real = cantidad producida / horas trabajadas.",
  },
};

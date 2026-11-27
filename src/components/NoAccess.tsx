import { ShieldOff } from "lucide-react";

interface NoAccessProps {
  description: string;
  title?: string;
}

/** Estado común cuando el usuario no tiene permiso sobre un reporte. */
export default function NoAccess({
  description,
  title = "Sin acceso a este reporte",
}: NoAccessProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5">
      <div className="w-16 h-16 rounded-full bg-background-secondary border border-border-card flex items-center justify-center">
        <ShieldOff className="w-8 h-8 text-subtitle" />
      </div>
      <h2 className="text-xl font-bold text-title">{title}</h2>
      <p className="text-sm text-subtitle text-center max-w-md">{description}</p>
    </div>
  );
}

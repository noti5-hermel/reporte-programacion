import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import { useAuth } from "../hooks/useAuth";

export default function MainLayout() {
  const { logout } = useAuth();
  const authUrl = import.meta.env.VITE_AUTH_FRONTEND_URL || "http://localhost:5173/";
  const targetUrl = new URL('/menu', authUrl).toString();

  const handleGoToMenu = () => {
  window.location.href = targetUrl;
};

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* HEADER: Ocupa todo el ancho superior */}
      <header className="w-full bg-card border-b border-border h-16 flex items-center justify-between px-6 z-10">
        <div>
          <h1 className="text-xl font-bold text-foreground">Reporte de Programación</h1>
        </div>
        
        {/* Contenedor de botones a la derecha */}
        <div className="flex items-center gap-4">
          <button
                onClick={handleGoToMenu}
                className="group flex h-12 w-32 items-center justify-center rounded-xl border border-border-card bg-background-secondary text-subtitle hover:border-border-card hover:bg-background-primary hover:text-title transition-all duration-200 shadow-sm"
                title="Volver al menu de aplicaiones"
              >
                Menú de aplicaciones
              </button>
          <button 
            onClick={() => logout()}
            className="group flex h-12 w-32 items-center justify-center rounded-xl border border-border-card bg-background-secondary text-subtitle hover:border-border-card hover:bg-background-primary hover:text-title transition-all duration-200 shadow-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* CONTENEDOR INFERIOR: Sidebar + Contenido Principal */}
      <div className="flex flex-grow">
        {/* Sidebar fija a la izquierda */}
        <Sidebar />

        {/* Contenido dinámico a la derecha */}
        <main className="flex-grow p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
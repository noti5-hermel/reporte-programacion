import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext.tsx";

// --- INICIO DE LA CONFIGURACIÓN DE AG GRID ---
// Importar los módulos necesarios de AG Grid
import { ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

// Registrar los módulos que necesita la aplicación.
// ClientSideRowModelModule es el módulo principal para las funcionalidades del lado del cliente (ordenar, filtrar, etc.)
ModuleRegistry.registerModules([ ClientSideRowModelModule ]);
// --- FIN DE LA CONFIGURACIÓN DE AG GRID ---

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

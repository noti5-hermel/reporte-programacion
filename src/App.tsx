import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Sidebar from "./components/Sidebar/Sidebar";

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar lateral fijo */}
        <Sidebar />

        {/* Contenedor de las páginas */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <AppRoutes />
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;

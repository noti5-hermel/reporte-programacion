import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Sidebar from "./components/Sidebar/Sidebar";

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        {/* Sidebar lateral fijo */}
        <Sidebar />

        {/* Contenedor de las páginas */}
        <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          <AppRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;

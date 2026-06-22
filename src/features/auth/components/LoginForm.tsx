import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
    } catch (err) {
      setError("Failed to log in");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-background-primary">
      <div className="w-full max-w-md p-8 space-y-6 bg-background-secondary border border-border-card rounded-2xl shadow-card">
        <h1 className="text-2xl font-black tracking-tight text-title text-center">Iniciar Sesión</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="text-sm font-bold text-title"
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2.5 mt-1 bg-background-primary border border-border-card rounded-xl text-sm font-bold text-title focus:ring-2 focus:ring-button-primary/20 focus:border-button-primary outline-none transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-bold text-title"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 mt-1 bg-background-primary border border-border-card rounded-xl text-sm font-bold text-title focus:ring-2 focus:ring-button-primary/20 focus:border-button-primary outline-none transition-all"
            />
          </div>
          {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full bg-button-primary hover:bg-button-primary-hover text-white font-bold px-6 py-2.5 rounded-xl shadow-btn-glow hover:shadow-btn-glow-hover transition-all duration-200"
            >
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

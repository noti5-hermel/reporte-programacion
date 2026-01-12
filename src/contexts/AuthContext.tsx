import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { API_BASE_URL } from '../api/config';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean; // <-- Nuevo estado
  login: (username, password) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // <-- Inicia en true

  useEffect(() => {
    // Comprueba el token en localStorage solo en la carga inicial.
    const token = localStorage.getItem('token');
    if (token) {
      // En una app real, aquí validarías el token con el backend.
      setIsAuthenticated(true);
    }
    // Marca la comprobación inicial como completada.
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // 1. Crear un objeto para transformar los datos
    const details = {
      'username': username,
      'password': password
    };

    // 2. Convertir el objeto a formato x-www-form-urlencoded
    // Resultado: "username=tu_usuario&password=tu_contraseña"
    const formBody = Object.keys(details)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key]))
      .join('&');

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/`, {
      method: 'POST',
      headers: {
        // 3. Cambiar el Content-Type para que coincida con el formato del cuerpo
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      // 4. Enviar el cuerpo en el nuevo formato
      body: formBody
    });

    if (!response.ok) {
      // Intenta leer el error del backend para dar un mensaje más claro
      const errorData = await response.json().catch(() => ({}));
      console.error("Error de login:", errorData);
      throw new Error('Fallo al iniciar sesión. Revisa tus credenciales.');
    }

    const data = await response.json();
    localStorage.setItem('token', data.access_token); // Es común que el token se llame 'access_token'
    setIsAuthenticated(true);
  };


  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const value = { isAuthenticated, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

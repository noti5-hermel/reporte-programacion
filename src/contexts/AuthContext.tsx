import {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { API_BASE_URL } from "../api/config";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  hasRole: (roles: string[]) => boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    // Try to get token from URL first
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      return urlToken;
    }
    // Fall back to localStorage
    return localStorage.getItem('token');
  });

  const [user, setUser] = useState<any>(() => {
    try {
      // Try to get user from URL first
      const params = new URLSearchParams(window.location.search);
      const userData = params.get('user');
      if (userData) {
        const decodedUser = JSON.parse(decodeURIComponent(userData));
        localStorage.setItem('user', JSON.stringify(decodedUser));
        return decodedUser;
      }
      // Fall back to localStorage
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.username) {
          return parsedUser;
        }
      }
    } catch (err) {
      console.error('Error initializing auth state:', err);
    }
    return null;
  });

  const isLoggingOut = useRef(false);
  const isProcessingAuth = useRef(false);

  const resetActivity = () => {
    localStorage.setItem("last_activity", Date.now().toString());
  };

  useEffect(() => {
    // Process URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const userData = params.get('user');

    if (urlToken && userData) {
      isProcessingAuth.current = true;
      try {
        const decodedUser = JSON.parse(decodeURIComponent(userData));
        localStorage.setItem('token', urlToken);
        localStorage.setItem('user', JSON.stringify(decodedUser));
        resetActivity();
        setToken(urlToken);
        setUser(decodedUser);
        
        // Use a simpler URL cleanup
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState(null, '', cleanUrl);
      } catch (e) {
        console.error('Failed to parse user from URL', e);
      } finally {
        isProcessingAuth.current = false;
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem("user");
      if (storedUser && !user) {
        setUser(JSON.parse(storedUser));
      }
      resetActivity();
    }
  }, [token, user]);

  useEffect(() => {
    if (token) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      const resetTimer = () => resetActivity();

      events.forEach(event => window.addEventListener(event, resetTimer));

      const checkInactivity = () => {
        const lastActivity = localStorage.getItem("last_activity");
        const inactivityLimit = 60 * 60 * 1000; // 1 hour
        if (lastActivity && Date.now() - parseInt(lastActivity) > inactivityLimit) {
          logout();
        }
      };

      const interval = setInterval(checkInactivity, 60000); // Check every minute

      return () => {
        events.forEach(event => window.removeEventListener(event, resetTimer));
        clearInterval(interval);
      };
    }
  }, [token]);

  useEffect(() => {
    // No redirigir si estamos procesando auth desde URL params o haciendo logout
    if (isLoggingOut.current || isProcessingAuth.current || user) return;

    // Verificar también localStorage como respaldo síncrono para evitar race conditions
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      // Ya hay sesión en localStorage, restaurar estado
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error restoring session from localStorage', e);
      }
      return;
    }

    // Check if we are already in the middle of a redirect or if there's a token in URL
    const params = new URLSearchParams(window.location.search);
    if (!params.get('token')) {
      const envUrl = import.meta.env.VITE_AUTH_FRONTEND_URL || "http://192.168.1.155:5173/login";
      let authUrl = envUrl;
      try {
        const url = new URL(envUrl);
        const isLocalOrIp = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1' || 
                            /^(?:\d{1,3}\.){3}\d{1,3}$/.test(window.location.hostname);
        if (isLocalOrIp) {
          url.hostname = window.location.hostname;
          authUrl = url.toString();
        }
      } catch (e) {
        console.error("Error parsing VITE_AUTH_FRONTEND_URL", e);
      }
      // Usar la URL base de report (sin /login) como returnUrl para que auth redirija de vuelta correctamente
      const returnUrl = window.location.origin + '/';
      window.location.href = `${authUrl}?returnUrl=${encodeURIComponent(returnUrl)}`;
    }
  }, [user]);

  const login = async (username: string, password: string) => {
    const authApiUrl = import.meta.env.VITE_AUTH_API_URL || API_BASE_URL;
    const response = await fetch(`${authApiUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username,
        password,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      resetActivity();
      setToken(data.access_token);
      setUser(data.user);
    } else {
      throw new Error("Login failed");
    }
  };

  const logout = () => {
    isLoggingOut.current = true;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("last_activity");
    setToken(null);
    setUser(null);
    const envUrl = import.meta.env.VITE_AUTH_FRONTEND_URL || "http://192.168.1.155:5173";
    let authUrl = envUrl;
    try {
      const url = new URL(envUrl);
      const isLocalOrIp = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' || 
                          /^(?:\d{1,3}\.){3}\d{1,3}$/.test(window.location.hostname);
      if (isLocalOrIp) {
        url.hostname = window.location.hostname;
        authUrl = url.toString();
      }
    } catch (e) {
      console.error("Error parsing VITE_AUTH_FRONTEND_URL", e);
    }
    window.location.href = `${authUrl}?action=logout`;
  };

  const hasRole = (roles: string[]) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!token, user, hasRole, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
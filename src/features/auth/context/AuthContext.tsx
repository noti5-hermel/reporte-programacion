import {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { API_BASE_URL, REPORTS_API_URL } from "../../../config/api";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  hasRole: (roles: string[]) => boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  authServiceAvailable: boolean | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      return urlToken;
    }
    return localStorage.getItem('token');
  });

  const [user, setUser] = useState<any>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const userData = params.get('user');
      if (userData) {
        const decodedUser = JSON.parse(decodeURIComponent(userData));
        localStorage.setItem('user', JSON.stringify(decodedUser));
        return decodedUser;
      }
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

  const [authServiceAvailable, setAuthServiceAvailable] = useState<boolean | null>(null);

  const isLoggingOut = useRef(false);
  const isProcessingAuth = useRef(false);

  const resetActivity = () => {
    localStorage.setItem("last_activity", Date.now().toString());
  };

  useEffect(() => {
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
        const inactivityLimit = 60 * 60 * 1000;
        if (lastActivity && Date.now() - parseInt(lastActivity) > inactivityLimit) {
          logout();
        }
      };

      const interval = setInterval(checkInactivity, 60000);

      return () => {
        events.forEach(event => window.removeEventListener(event, resetTimer));
        clearInterval(interval);
      };
    }
  }, [token]);

  useEffect(() => {
    if (token || user || isLoggingOut.current || isProcessingAuth.current) return;

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) return;

    const checkAuthHealth = async () => {
      const healthUrl = import.meta.env.VITE_AUTH_HEALTH_URL || "http://192.168.1.155:8081/api/auth/health";
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(healthUrl, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setAuthServiceAvailable(data?.status === "UP");
        } else {
          setAuthServiceAvailable(false);
        }
      } catch {
        setAuthServiceAvailable(false);
      }
    };

    checkAuthHealth();
  }, []);

  useEffect(() => {
    if (isLoggingOut.current || isProcessingAuth.current || user || token) return;

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error restoring session from localStorage', e);
      }
      return;
    }

    if (authServiceAvailable === true) {
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
        const returnUrl = window.location.origin + '/';
        window.location.href = `${authUrl}?returnUrl=${encodeURIComponent(returnUrl)}`;
      }
    }
  }, [authServiceAvailable, user, token]);

  const login = async (username: string, password: string) => {
    const loginUrl = authServiceAvailable === false
      ? `${REPORTS_API_URL}/api/v1/auth/login`
      : `${import.meta.env.VITE_AUTH_API_URL || API_BASE_URL}/api/v1/auth/login`;

    const response = await fetch(loginUrl, {
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
      value={{ isAuthenticated: !!token, user, hasRole, login, logout, authServiceAvailable }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

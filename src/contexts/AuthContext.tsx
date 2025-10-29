import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
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
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [token]);

  const login = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
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
      setToken(data.access_token);
      setUser(data.user);
    } else {
      throw new Error("Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
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

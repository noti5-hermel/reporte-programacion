import { useState, useEffect } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      // You might want to verify the token with your backend here
      // For now, we'll just assume it's valid if it exists
      // You could decode the token to get user info if it's a JWT
    }
  }, [token]);

  const login = async (username, password) => {
    const response = await fetch("http://192.168.1.155:8001/api/v1/auth/login", {
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
      setToken(data.access_token);
      setUser(data.user);
    } else {
      throw new Error("Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return {
    isAuthenticated: !!token,
    user,
    login,
    logout,
  };
};

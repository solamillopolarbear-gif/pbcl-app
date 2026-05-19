import { createContext, useContext, useState, useEffect } from "react";
import { setAuthToken, getAuthToken } from "../api/base44";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("base44_token");
    const userData = localStorage.getItem("base44_user");
    if (token && userData) {
      setAuthToken(token);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`https://app.base44.com/api/apps/69fd933c4f54c69e74300a3f/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Login failed");
    }
    const data = await res.json();
    localStorage.setItem("base44_token", data.token);
    localStorage.setItem("base44_user", JSON.stringify(data.user));
    setAuthToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("base44_token");
    localStorage.removeItem("base44_user");
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

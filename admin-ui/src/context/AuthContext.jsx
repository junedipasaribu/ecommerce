import React, { createContext, useContext, useState, useEffect } from "react";
import { usersData } from "../components/Sample";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const login = async (email, password) => {
    // Lightweight mock login: match by email from sample data.
    // If you have a backend, replace this with API call to /auth.
    const found = usersData.find((u) => u.email === email);
    if (!found) {
      throw new Error("Email atau Password Salah.");
    }

    // NOTE: this mock accepts any password if email exists.
    const mockToken = `mock-token-${found.id}`;
    setUser(found);
    setToken(mockToken);
    localStorage.setItem(
      "auth",
      JSON.stringify({ user: found, token: mockToken })
    );
    return { user: found, token: mockToken };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        const norm = normalizeUser(parsed.user);
        setUser(norm || null);
        setToken(parsed.token || null);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const payload = res.data || {};
      let u = payload.user;
      const t = payload.token;
      u = normalizeUser(u);
      if (!u || !t) throw new Error("Invalid response from auth server");
      setUser(u);
      setToken(t);
      localStorage.setItem("auth", JSON.stringify({ user: u, token: t }));
      return { user: u, token: t };
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Login failed";
      throw new Error(msg);
    }
  };

  // normalize user shape returned from API or storage
  function normalizeUser(u) {
    if (!u) return u;
    const out = { ...u };
    // role might be an object { key/name } or string
    if (typeof out.role === "object" && out.role !== null) {
      out.role =
        out.role.key ||
        out.role.name ||
        out.role.role ||
        out.role.id ||
        out.role;
    }
    // Keep role as-is from backend (now uppercase: ADMIN, USER)
    // Backend now returns normalized uppercase roles
    if (typeof out.role === "string") out.role = out.role.trim();
    // some APIs return permissions under out.permissions or out.role.permissions
    if (
      (!out.permissions || Object.keys(out.permissions).length === 0) &&
      out.role &&
      out.role.permissions
    ) {
      out.permissions = out.role.permissions;
    }
    // ensure permissions is at least an object
    out.permissions = out.permissions || {};
    return out;
  }

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

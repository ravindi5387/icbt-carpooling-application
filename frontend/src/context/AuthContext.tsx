import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Role, RideRole, User } from "../types";
import {
  login as apiLogin,
  registerUser as apiRegister,
  getProfile,
} from "../services/api";

export const ADMIN_USERNAME = "icbt.admin";
export const ADMIN_PASSWORD = "Carpool@Admin2026";
interface AuthValue {
  user: User | null;
  token: string | null;
  login: (
    identifier: string,
    password: string,
    accountType: "user" | "admin",
  ) => Promise<"user" | "admin">;
  register: (
    name: string,
    email: string,
    password: string,
    memberType: Role,
    rideRole: RideRole,
  ) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthValue | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const x = localStorage.getItem("icbt_user");
      return x ? JSON.parse(x) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("icbt_token"),
  );
  useEffect(() => {
    if (user) localStorage.setItem("icbt_user", JSON.stringify(user));
    else localStorage.removeItem("icbt_user");
  }, [user]);
  useEffect(() => {
    if (token) localStorage.setItem("icbt_token", token);
    else localStorage.removeItem("icbt_token");
  }, [token]);
  useEffect(() => {
    if (token)
      getProfile()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("icbt_token");
          localStorage.removeItem("icbt_user");
          setToken(null);
          setUser(null);
        });
  }, []);
  async function login(
    identifier: string,
    password: string,
    accountType: "user" | "admin",
  ) {
    const r = await apiLogin(identifier, password, accountType);
    setUser(r.user);
    setToken(r.token);
    return r.user.isAdmin ? "admin" : "user";
  }
  async function register(
    name: string,
    email: string,
    password: string,
    memberType: Role,
    rideRole: RideRole,
  ) {
    await apiRegister(name, email, password, memberType);
  }
  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("icbt_user");
    localStorage.removeItem("icbt_token");
  }
  const value = useMemo(
    () => ({ user, token, login, register, logout }),
    [user, token],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const x = useContext(AuthContext);
  if (!x) throw new Error("useAuth must be inside AuthProvider");
  return x;
}

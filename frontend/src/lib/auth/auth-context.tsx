/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type Role = "admin" | "receptionist";
type User = { name: string; role: Role };

type AuthContextValue = {
  user: User | null;
  signIn: (name: string, role: Role) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "clinic_erh_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: (name, role) => {
        const next = { name, role };
        setUser(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      },
      signOut: () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

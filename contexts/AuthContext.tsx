"use client";

import { createContext, useContext } from "react";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "user";
}

interface AuthContextValue {
  user: AuthUser;
  companyName: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  value,
  children
}: {
  value: AuthContextValue;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

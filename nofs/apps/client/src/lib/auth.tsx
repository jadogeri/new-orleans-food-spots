import React, { createContext, useContext } from "react";
import { useGetMe, useLogout, setAuthTokenGetter } from "@repo/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { User } from "@repo/api-client-react";

// Setup global auth token getter
setAuthTokenGetter(() => localStorage.getItem("nola_token"));

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  setToken: (token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading, refetch } = useGetMe();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync(undefined as unknown as void);
    } catch (e) {
      // Ignore
    } finally {
      localStorage.removeItem("nola_token");
      queryClient.clear();
      setLocation("/");
    }
  };

  const setToken = async (token: string): Promise<void> => {
    localStorage.setItem("nola_token", token);
    await refetch();
  };

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, logout: handleLogout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

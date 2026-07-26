"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type AuthAccount,
} from "@/contracts/auth";
import { authApi } from "@/lib/api";

export type AnonymousAccount = AuthAccount;

type AuthContextValue = {
  account: AnonymousAccount | null;
  isHydrated: boolean;
  rotateAlias: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AnonymousAccount | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void (async () => {
        try {
          const data = await authApi.session();
          setAccount(data.account);
        } finally {
          setIsHydrated(true);
        }
      })();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const rotateAlias = useCallback(async () => {
    setAccount((await authApi.rotateAlias()).account);
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    setAccount(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      account,
      isHydrated,
      rotateAlias,
      signOut,
    }),
    [account, isHydrated, rotateAlias, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}

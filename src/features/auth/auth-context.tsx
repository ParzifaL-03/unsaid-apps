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
  aliasResponseSchema,
  sessionResponseSchema,
  type AuthAccount,
} from "@/contracts/auth";
import { apiFetch, getApiError } from "@/lib/api-client";

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
          const response = await apiFetch("/auth/session", {
            cache: "no-store",
          });
          if (response.ok) {
            const data = sessionResponseSchema.parse(await response.json());
            setAccount(data.account);
          }
        } finally {
          setIsHydrated(true);
        }
      })();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const rotateAlias = useCallback(async () => {
    const response = await apiFetch("/me/alias", { method: "POST" });
    if (!response.ok) {
      throw new Error(await getApiError(response, "Unable to rotate alias."));
    }
    setAccount(aliasResponseSchema.parse(await response.json()).account);
  }, []);

  const signOut = useCallback(async () => {
    await apiFetch("/auth/sign-out", { method: "POST" });
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

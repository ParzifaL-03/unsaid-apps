"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AnonymousAccount = {
  alias: string;
  email: string;
  provider?: "local" | "google";
  name?: string;
  image?: string;
};

type AuthContextValue = {
  account: AnonymousAccount | null;
  isHydrated: boolean;
  signIn: (account: AnonymousAccount) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "unsaid-account";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AnonymousAccount | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void (async () => {
        try {
          const response = await fetch("/api/auth/session", {
            cache: "no-store",
          });
          if (response.ok) {
            const data = (await response.json()) as {
              account: AnonymousAccount | null;
            };
            if (data.account) {
              setAccount(data.account);
              setIsHydrated(true);
              return;
            }
          }
        } catch {
          // Fall back to local-only auth when the server session is unavailable.
        }

        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            setAccount(JSON.parse(saved) as AnonymousAccount);
          } catch {
            window.localStorage.removeItem(STORAGE_KEY);
          }
        }
        setIsHydrated(true);
      })();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      account,
      isHydrated,
      signIn: (nextAccount) => {
        const localAccount = { ...nextAccount, provider: "local" as const };
        setAccount(localAccount);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(localAccount));
      },
      signOut: () => {
        setAccount(null);
        window.localStorage.removeItem(STORAGE_KEY);
        void fetch("/api/auth/sign-out", { method: "POST" });
      },
    }),
    [account, isHydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}

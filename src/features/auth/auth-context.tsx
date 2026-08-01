"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { type AuthAccount } from "@/contracts/auth";
import {
  clearAuthenticatedCache,
  useRotateAliasMutation,
  useSessionQuery,
  useSignOutMutation,
} from "@/lib/api/query";

export type AnonymousAccount = AuthAccount;

type AuthContextValue = {
  account: AnonymousAccount | null;
  isHydrated: boolean;
  rotateAlias: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const session = useSessionQuery();
  const rotateAliasMutation = useRotateAliasMutation();
  const signOutMutation = useSignOutMutation();
  const account = session.data?.account ?? null;

  useEffect(() => {
    if (session.isSuccess && !session.data.account) {
      clearAuthenticatedCache(queryClient);
    }
  }, [queryClient, session.data?.account, session.isSuccess]);

  const rotateAlias = useCallback(async () => {
    await rotateAliasMutation.mutateAsync();
  }, [rotateAliasMutation]);

  const signOut = useCallback(async () => {
    await signOutMutation.mutateAsync();
  }, [signOutMutation]);

  const value = useMemo<AuthContextValue>(
    () => ({
      account,
      isHydrated: !session.isPending,
      rotateAlias,
      signOut,
    }),
    [account, rotateAlias, session.isPending, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}

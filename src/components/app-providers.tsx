"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/auth-context";
import { PostProvider } from "@/features/feed/post-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PostProvider>{children}</PostProvider>
    </AuthProvider>
  );
}

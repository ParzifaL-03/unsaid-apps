"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/auth-context";
import { PostProvider } from "@/features/feed/post-context";
import { OpenLetterProvider } from "@/features/open-letters/open-letter-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <OpenLetterProvider>
        <PostProvider>{children}</PostProvider>
      </OpenLetterProvider>
    </AuthProvider>
  );
}

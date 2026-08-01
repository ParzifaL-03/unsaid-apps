"use client";

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "@/components/ui";

export function AppQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            console.error("API query failed", error);
            toast.error(
              "Unable to load data",
              "Please refresh the page or try again in a moment.",
            );
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            console.error("API mutation failed", error);
            toast.error(
              "Unable to save changes",
              "Please check your connection and try again.",
            );
          },
        }),
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

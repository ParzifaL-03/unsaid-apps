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
  openLetterResponseSchema,
  openLettersResponseSchema,
} from "@/contracts/content";
import { apiFetch, getApiError } from "@/lib/api-client";
import type { OpenLetter } from "@/types/open-letter";

type NewOpenLetter = {
  recipientEmail: string;
  recipientLabel: string;
  subject: string;
  body: string;
};

type OpenLetterContextValue = {
  letters: OpenLetter[];
  isLoading: boolean;
  addLetter: (letter: NewOpenLetter) => Promise<OpenLetter>;
};

const OpenLetterContext = createContext<OpenLetterContextValue | null>(null);

export function OpenLetterProvider({ children }: { children: ReactNode }) {
  const [letters, setLetters] = useState<OpenLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void (async () => {
        try {
          const response = await apiFetch("/open-letters", {
            cache: "no-store",
          });
          if (response.ok) {
            const data = openLettersResponseSchema.parse(await response.json());
            setLetters(data.letters);
          }
        } finally {
          setIsLoading(false);
        }
      })();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const addLetter = useCallback(async (letter: NewOpenLetter) => {
    const response = await apiFetch("/open-letters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(letter),
    });

    if (!response.ok) {
      throw new Error(
        await getApiError(response, "Unable to send open letter."),
      );
    }

    const data = openLetterResponseSchema.parse(await response.json());
    setLetters((current) => [data.letter, ...current]);
    return data.letter;
  }, []);

  const value = useMemo<OpenLetterContextValue>(
    () => ({
      letters,
      isLoading,
      addLetter,
    }),
    [addLetter, isLoading, letters],
  );

  return (
    <OpenLetterContext.Provider value={value}>
      {children}
    </OpenLetterContext.Provider>
  );
}

export function useOpenLetters() {
  const value = useContext(OpenLetterContext);
  if (!value) {
    throw new Error("useOpenLetters must be used within OpenLetterProvider");
  }
  return value;
}

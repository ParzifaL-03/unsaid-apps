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
import { openLettersApi } from "@/lib/api";
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
          const data = await openLettersApi.list();
          setLetters(data.letters);
        } finally {
          setIsLoading(false);
        }
      })();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const addLetter = useCallback(async (letter: NewOpenLetter) => {
    const data = await openLettersApi.create(letter);
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

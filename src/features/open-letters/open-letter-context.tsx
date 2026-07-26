"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  useCreateOpenLetterMutation,
  useOpenLettersQuery,
} from "@/lib/api/query";
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
const EMPTY_LETTERS: OpenLetter[] = [];

export function OpenLetterProvider({ children }: { children: ReactNode }) {
  const lettersQuery = useOpenLettersQuery();
  const createLetterMutation = useCreateOpenLetterMutation();
  const letters = lettersQuery.data?.letters ?? EMPTY_LETTERS;

  const addLetter = useCallback(async (letter: NewOpenLetter) => {
    const data = await createLetterMutation.mutateAsync(letter);
    return data.letter;
  }, [createLetterMutation]);

  const value = useMemo<OpenLetterContextValue>(
    () => ({
      letters,
      isLoading: lettersQuery.isPending,
      addLetter,
    }),
    [addLetter, letters, lettersQuery.isPending],
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

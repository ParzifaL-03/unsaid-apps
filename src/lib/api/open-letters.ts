import type { z } from "zod";
import {
  createOpenLetterInputSchema,
  openLetterResponseSchema,
  openLettersResponseSchema,
} from "@/contracts/content";
import { apiRequest } from "@/lib/api-client";

export type CreateOpenLetterInput = z.input<
  typeof createOpenLetterInputSchema
>;

export const openLettersApi = {
  list: () =>
    apiRequest("/open-letters", openLettersResponseSchema, {
      headers: { "Cache-Control": "no-store" },
    }),
  create: (data: CreateOpenLetterInput) =>
    apiRequest("/open-letters", openLetterResponseSchema, {
      method: "POST",
      data,
    }),
};

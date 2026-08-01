import type { z } from "zod";
import {
  capsuleResponseSchema,
  capsulesResponseSchema,
  createCapsuleInputSchema,
} from "@/contracts/content";
import { apiRequest } from "@/lib/api-client";

export type CreateCapsuleInput = z.input<typeof createCapsuleInputSchema>;

export const capsulesApi = {
  list: () =>
    apiRequest("/capsules", capsulesResponseSchema, {
      headers: { "Cache-Control": "no-store" },
    }),
  create: (data: CreateCapsuleInput) =>
    apiRequest("/capsules", capsuleResponseSchema, { method: "POST", data }),
  publish: (id: string) =>
    apiRequest(`/capsules/${id}/publish`, capsuleResponseSchema, {
      method: "POST",
    }),
};

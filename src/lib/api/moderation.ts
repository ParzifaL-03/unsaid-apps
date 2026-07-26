import type { z } from "zod";
import {
  blockResponseSchema,
  createReportInputSchema,
  reportResponseSchema,
} from "@/contracts/moderation";
import { apiRequest } from "@/lib/api-client";

export type CreateReportInput = z.input<typeof createReportInputSchema>;

export const moderationApi = {
  report: (data: CreateReportInput) =>
    apiRequest("/reports", reportResponseSchema, { method: "POST", data }),
  block: (userId: string) =>
    apiRequest(`/blocks/${userId}`, blockResponseSchema, { method: "POST" }),
  unblock: (userId: string) =>
    apiRequest(`/blocks/${userId}`, blockResponseSchema, {
      method: "DELETE",
    }),
};

import { z } from "zod";
import { apiRequest } from "@/lib/api-client";

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  database: z.literal("connected"),
  latencyMs: z.number().int().min(0),
});

export const healthApi = {
  database: () => apiRequest("/health/database", healthResponseSchema),
};

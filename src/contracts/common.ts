import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid resource id.");

export const moodSchema = z.enum(["heavy", "hopeful", "nostalgic", "quiet"]);

export const apiMetaSchema = z.object({
  page: z.number().int(),
  totalPage: z.number().int(),
  totalData: z.number().int(),
});

export const apiErrorSchema = z.object({
  status: z.literal(false),
  statusCode: z.number().int(),
  data: z.object({
    error: z.object({
      code: z.string(),
      message: z.string(),
      fields: z.record(z.string(), z.array(z.string())).optional(),
    }),
  }),
  meta: z.null(),
});

export function apiResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    status: z.boolean(),
    statusCode: z.number().int(),
    data: dataSchema,
    meta: apiMetaSchema.nullable(),
  });
}

export const paginationSchema = z.object({
  cursor: objectIdSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type Mood = z.infer<typeof moodSchema>;

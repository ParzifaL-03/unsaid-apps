import { apiErrorSchema } from "@/contracts/common";

export async function getApiError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null);
  const result = apiErrorSchema.safeParse(payload);
  return result.success ? result.data.error.message : fallback;
}

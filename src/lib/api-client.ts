import { apiErrorSchema } from "@/contracts/common";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"
).replace(/\/$/, "");

export function apiUrl(path: string) {
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(apiUrl(path), {
    ...init,
    credentials: "include",
  });
}

export async function getApiError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null);
  const result = apiErrorSchema.safeParse(payload);
  return result.success ? result.data.error.message : fallback;
}

import {
  aliasResponseSchema,
  sessionResponseSchema,
  signOutResponseSchema,
} from "@/contracts/auth";
import { apiRequest, apiUrl } from "@/lib/api-client";

export const authApi = {
  googleUrl: () => apiUrl("/auth/google"),
  session: () => apiRequest("/auth/session", sessionResponseSchema),
  refresh: () =>
    apiRequest("/auth/refresh", sessionResponseSchema, { method: "POST" }),
  signOut: () =>
    apiRequest("/auth/sign-out", signOutResponseSchema, { method: "POST" }),
  rotateAlias: () =>
    apiRequest("/me/alias", aliasResponseSchema, { method: "POST" }),
};

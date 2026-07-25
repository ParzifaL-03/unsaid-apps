import { z } from "zod";

const mongoEnvSchema = z.object({
  MONGODB_URI: z.string().trim().min(1, "MONGODB_URI is required."),
});

const authSecretEnvSchema = z.object({
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must contain at least 32 characters."),
});

const googleEnvSchema = authSecretEnvSchema.extend({
  GOOGLE_CLIENT_ID: z.string().trim().min(1, "GOOGLE_CLIENT_ID is required."),
  GOOGLE_CLIENT_SECRET: z
    .string()
    .trim()
    .min(1, "GOOGLE_CLIENT_SECRET is required."),
  NEXT_PUBLIC_APP_URL: z.url().optional(),
});

const sessionEnvSchema = authSecretEnvSchema.extend({
  SESSION_MAX_AGE_DAYS: z.coerce.number().int().min(1).max(365).default(30),
});

export function getMongoEnv() {
  return mongoEnvSchema.parse(process.env);
}

export function getAuthSecretEnv() {
  return authSecretEnvSchema.parse(process.env);
}

export function getGoogleEnv() {
  return googleEnvSchema.parse(process.env);
}

export function getSessionEnv() {
  return sessionEnvSchema.parse(process.env);
}

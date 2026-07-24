import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { NextRequest, NextResponse } from "next/server";

export type AuthAccount = {
  userId?: string;
  alias: string;
  email: string;
  provider: "google";
  name?: string;
  image?: string;
};

export const SESSION_COOKIE = "unsaid-session";
export const OAUTH_STATE_COOKIE = "unsaid-oauth-state";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const STATE_MAX_AGE = 60 * 10;

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required for Google login.");
  }
  return secret;
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function sign(value: string) {
  return base64Url(
    createHmac("sha256", getAuthSecret()).update(value).digest(),
  );
}

function encodeSignedJson(value: unknown) {
  const payload = base64Url(JSON.stringify(value));
  return `${payload}.${sign(payload)}`;
}

function decodeSignedJson<T>(value: string): T | null {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function isSecureRequest(request: NextRequest) {
  return request.nextUrl.protocol === "https:";
}

export function createOauthState() {
  const state = base64Url(randomBytes(32));
  return {
    state,
    cookieValue: encodeSignedJson({ state }),
  };
}

export function readOauthState(value?: string) {
  if (!value) return null;
  return decodeSignedJson<{ state: string }>(value);
}

export function readSession(value?: string) {
  if (!value) return null;
  return decodeSignedJson<AuthAccount>(value);
}

export function setSessionCookie(
  response: NextResponse,
  request: NextRequest,
  account: AuthAccount,
) {
  response.cookies.set(SESSION_COOKIE, encodeSignedJson(account), {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export function setOauthStateCookie(
  response: NextResponse,
  request: NextRequest,
  value: string,
) {
  response.cookies.set(OAUTH_STATE_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    maxAge: STATE_MAX_AGE,
    path: "/",
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(OAUTH_STATE_COOKIE);
}

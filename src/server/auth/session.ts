import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import type { AuthAccount } from "@/contracts/auth";
import { connectMongo } from "@/server/db/connect";
import { SessionModel, UserModel } from "@/server/db/models";
import { getAuthSecretEnv, getSessionEnv } from "@/server/env";
import { ApiError } from "@/server/http";

export const SESSION_COOKIE = "unsaid-session";
export const OAUTH_STATE_COOKIE = "unsaid-oauth-state";
const STATE_MAX_AGE = 60 * 10;

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function sign(value: string) {
  return base64Url(
    createHmac("sha256", getAuthSecretEnv().AUTH_SECRET).update(value).digest(),
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

export function toAuthAccount(user: {
  _id: { toString(): string };
  alias: string;
  email: string;
  name?: string | null;
  imageUrl?: string | null;
}): AuthAccount {
  return {
    userId: user._id.toString(),
    alias: user.alias,
    email: user.email,
    provider: "google",
    name: user.name ?? undefined,
    image: user.imageUrl ?? undefined,
  };
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

export async function createDatabaseSession(
  request: NextRequest,
  userId: string,
) {
  await connectMongo();
  const { SESSION_MAX_AGE_DAYS, AUTH_SECRET } = getSessionEnv();
  const token = base64Url(randomBytes(32));
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0];
  const expiresAt = new Date(
    Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  );

  await SessionModel.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
    lastUsedAt: new Date(),
    userAgent: request.headers.get("user-agent")?.slice(0, 500),
    ipHash: forwardedFor
      ? createHmac("sha256", AUTH_SECRET)
          .update(forwardedFor.trim())
          .digest("hex")
      : undefined,
  });

  return { token, expiresAt };
}

export async function getSessionAccount(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  await connectMongo();
  const session = await SessionModel.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  });
  if (!session) return null;

  const user = await UserModel.findOne({
    _id: session.userId,
    status: "active",
  });
  if (!user) return null;

  if (Date.now() - session.lastUsedAt.getTime() > 60 * 60 * 1000) {
    await SessionModel.updateOne(
      { _id: session._id },
      { $set: { lastUsedAt: new Date() } },
    );
  }

  return { user, account: toAuthAccount(user) };
}

export async function requireSessionUser(request: NextRequest) {
  const session = await getSessionAccount(request);
  if (!session) {
    throw new ApiError(
      401,
      "AUTH_REQUIRED",
      "A Gmail session is required for this action.",
    );
  }
  return session.user;
}

export async function revokeDatabaseSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return;
  await connectMongo();
  await SessionModel.deleteOne({ tokenHash: hashToken(token) });
}

export function setSessionCookie(
  response: NextResponse,
  request: NextRequest,
  session: { token: string; expiresAt: Date },
) {
  response.cookies.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    expires: session.expiresAt,
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

import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  OAUTH_STATE_COOKIE,
  clearAuthCookies,
  readOauthState,
  setSessionCookie,
} from "@/lib/auth-session";
import { upsertGoogleUser } from "@/lib/mongo/auth-users";

type GoogleUserInfo = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
}

const aliasAdjectives = ["quiet", "paper", "soft", "north", "golden"];
const aliasNouns = ["comet", "moon", "thunder", "window", "static"];

function aliasFromEmail(email: string) {
  const hash = createHash("sha256").update(email.toLowerCase()).digest();
  const adjective = aliasAdjectives[hash[0] % aliasAdjectives.length];
  const noun = aliasNouns[hash[1] % aliasNouns.length];
  return `${adjective} ${noun}`;
}

function redirectWithError(request: NextRequest, error: string) {
  return NextResponse.redirect(new URL(`/?auth=${error}`, request.url));
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return redirectWithError(request, "missing-google-config");
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = readOauthState(
    request.cookies.get(OAUTH_STATE_COOKIE)?.value,
  );

  if (!code || !state || savedState?.state !== state) {
    const response = redirectWithError(request, "invalid-google-state");
    clearAuthCookies(response);
    return response;
  }

  const redirectUri = new URL("/api/auth/google/callback", getBaseUrl(request));
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri.toString(),
    }),
  });

  if (!tokenResponse.ok) {
    const response = redirectWithError(request, "google-token-failed");
    clearAuthCookies(response);
    return response;
  }

  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token) {
    const response = redirectWithError(request, "google-token-missing");
    clearAuthCookies(response);
    return response;
  }

  const userResponse = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { Authorization: `Bearer ${token.access_token}` },
    },
  );

  if (!userResponse.ok) {
    const response = redirectWithError(request, "google-user-failed");
    clearAuthCookies(response);
    return response;
  }

  const user = (await userResponse.json()) as GoogleUserInfo;
  if (!user.sub || !user.email || user.email_verified === false) {
    const response = redirectWithError(request, "google-email-unverified");
    clearAuthCookies(response);
    return response;
  }

  let databaseUser;
  try {
    databaseUser = await upsertGoogleUser({
      email: user.email,
      emailVerified: user.email_verified ?? true,
      providerAccountId: user.sub,
      alias: aliasFromEmail(user.email),
      name: user.name,
      image: user.picture,
    });
  } catch {
    const response = redirectWithError(request, "500");
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  clearAuthCookies(response);
  setSessionCookie(response, request, {
    userId: databaseUser._id.toString(),
    alias: aliasFromEmail(user.email),
    email: user.email,
    provider: "google",
    name: user.name,
    image: user.picture,
  });
  return response;
}

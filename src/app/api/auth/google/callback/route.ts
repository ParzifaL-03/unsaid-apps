import { NextRequest, NextResponse } from "next/server";
import {
  OAUTH_STATE_COOKIE,
  clearAuthCookies,
  createDatabaseSession,
  readOauthState,
  setSessionCookie,
} from "@/server/auth/session";
import {
  googleUserInfoSchema,
  upsertGoogleUser,
} from "@/server/services/auth.service";

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
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

  const token = (await tokenResponse.json()) as unknown;
  const accessToken =
    typeof token === "object" &&
    token !== null &&
    "access_token" in token &&
    typeof token.access_token === "string"
      ? token.access_token
      : null;
  if (!accessToken) {
    const response = redirectWithError(request, "google-token-missing");
    clearAuthCookies(response);
    return response;
  }

  const userResponse = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!userResponse.ok) {
    const response = redirectWithError(request, "google-user-failed");
    clearAuthCookies(response);
    return response;
  }

  const userResult = googleUserInfoSchema.safeParse(await userResponse.json());
  if (!userResult.success || userResult.data.email_verified === false) {
    const response = redirectWithError(request, "google-email-unverified");
    clearAuthCookies(response);
    return response;
  }

  let databaseUser;
  let session;
  try {
    databaseUser = await upsertGoogleUser(userResult.data);
    session = await createDatabaseSession(request, databaseUser._id.toString());
  } catch {
    const response = redirectWithError(request, "500");
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  clearAuthCookies(response);
  setSessionCookie(response, request, session);
  return response;
}

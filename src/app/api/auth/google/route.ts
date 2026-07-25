import { NextRequest, NextResponse } from "next/server";
import { createOauthState, setOauthStateCookie } from "@/server/auth/session";
import { getGoogleEnv } from "@/server/env";

export function GET(request: NextRequest) {
  let config;
  try {
    config = getGoogleEnv();
  } catch (error) {
    console.error("Invalid Google OAuth configuration:", error);
    return NextResponse.redirect(
      new URL("/?auth=missing-google-config", request.url),
    );
  }

  const { state, cookieValue } = createOauthState();
  const redirectUri = new URL(
    "/api/auth/google/callback",
    config.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin,
  );
  const authorizationUrl = new URL(
    "https://accounts.google.com/o/oauth2/v2/auth",
  );

  authorizationUrl.searchParams.set("client_id", config.GOOGLE_CLIENT_ID);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri.toString());
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid email profile");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authorizationUrl);
  setOauthStateCookie(response, request, cookieValue);
  return response;
}

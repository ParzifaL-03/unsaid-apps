import { NextRequest, NextResponse } from "next/server";
import { createOauthState, setOauthStateCookie } from "@/server/auth/session";

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
}

export function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/?auth=missing-google-client", request.url),
    );
  }
  if (!process.env.AUTH_SECRET) {
    return NextResponse.redirect(
      new URL("/?auth=missing-auth-secret", request.url),
    );
  }

  const { state, cookieValue } = createOauthState();
  const redirectUri = new URL("/api/auth/google/callback", getBaseUrl(request));
  const authorizationUrl = new URL(
    "https://accounts.google.com/o/oauth2/v2/auth",
  );

  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri.toString());
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid email profile");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authorizationUrl);
  setOauthStateCookie(response, request, cookieValue);
  return response;
}

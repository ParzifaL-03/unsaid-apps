import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/auth-session";

export function GET(request: NextRequest) {
  const account = readSession(request.cookies.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ account });
}

import { NextRequest } from "next/server";
import { signOutResponseSchema } from "@/contracts/auth";
import { clearAuthCookies, revokeDatabaseSession } from "@/server/auth/session";
import { handleApiError, jsonResponse } from "@/server/http";

export async function POST(request: NextRequest) {
  let response;
  try {
    await revokeDatabaseSession(request);
    response = jsonResponse(signOutResponseSchema, { ok: true });
  } catch (error) {
    response = handleApiError(error);
  }
  clearAuthCookies(response);
  return response;
}

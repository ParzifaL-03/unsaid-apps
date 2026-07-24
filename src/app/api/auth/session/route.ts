import { NextRequest } from "next/server";
import { sessionResponseSchema } from "@/contracts/auth";
import { getSessionAccount } from "@/server/auth/session";
import { handleApiError, jsonResponse } from "@/server/http";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionAccount(request);
    return jsonResponse(sessionResponseSchema, {
      account: session?.account ?? null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

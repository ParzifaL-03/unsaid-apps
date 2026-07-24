import { NextRequest } from "next/server";
import { aliasResponseSchema } from "@/contracts/auth";
import { requireSessionUser, toAuthAccount } from "@/server/auth/session";
import { ApiError, handleApiError, jsonResponse } from "@/server/http";
import { rotateUserAlias } from "@/server/services/auth.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser(request);
    const updated = await rotateUserAlias(user._id.toString(), user.alias);
    if (!updated) {
      throw new ApiError(404, "USER_NOT_FOUND", "User was not found.");
    }
    return jsonResponse(aliasResponseSchema, {
      account: toAuthAccount(updated),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

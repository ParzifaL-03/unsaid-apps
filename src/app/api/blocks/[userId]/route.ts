import { NextRequest } from "next/server";
import { z } from "zod";
import { objectIdSchema } from "@/contracts/common";
import { blockResponseSchema } from "@/contracts/moderation";
import { requireSessionUser } from "@/server/auth/session";
import { handleApiError, jsonResponse, parseParams } from "@/server/http";
import { blockUser, unblockUser } from "@/server/services/moderation.service";

export const runtime = "nodejs";

const paramsSchema = z.strictObject({ userId: objectIdSchema });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const user = await requireSessionUser(request);
    const { userId } = parseParams(await params, paramsSchema);
    return jsonResponse(
      blockResponseSchema,
      await blockUser(user, userId),
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const user = await requireSessionUser(request);
    const { userId } = parseParams(await params, paramsSchema);
    return jsonResponse(blockResponseSchema, await unblockUser(user, userId));
  } catch (error) {
    return handleApiError(error);
  }
}

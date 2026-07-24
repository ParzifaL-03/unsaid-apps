import { NextRequest } from "next/server";
import { z } from "zod";
import { objectIdSchema } from "@/contracts/common";
import {
  reactionInputSchema,
  reactionResponseSchema,
} from "@/contracts/content";
import { requireSessionUser } from "@/server/auth/session";
import {
  handleApiError,
  jsonResponse,
  parseJson,
  parseParams,
} from "@/server/http";
import { addEcho, removeEcho } from "@/server/services/post.service";

export const runtime = "nodejs";

const paramsSchema = z.strictObject({ id: objectIdSchema });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSessionUser(request);
    const { id } = parseParams(await params, paramsSchema);
    await parseJson(request, reactionInputSchema);
    return jsonResponse(reactionResponseSchema, await addEcho(user, id), 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSessionUser(request);
    const { id } = parseParams(await params, paramsSchema);
    return jsonResponse(reactionResponseSchema, await removeEcho(user, id));
  } catch (error) {
    return handleApiError(error);
  }
}

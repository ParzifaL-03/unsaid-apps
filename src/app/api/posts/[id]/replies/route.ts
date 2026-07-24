import { NextRequest } from "next/server";
import { z } from "zod";
import { objectIdSchema } from "@/contracts/common";
import {
  createReplyInputSchema,
  repliesResponseSchema,
  replyResponseSchema,
} from "@/contracts/content";
import { requireSessionUser } from "@/server/auth/session";
import {
  handleApiError,
  jsonResponse,
  parseJson,
  parseParams,
} from "@/server/http";
import { createReply, listReplies } from "@/server/services/post.service";

export const runtime = "nodejs";

const paramsSchema = z.strictObject({ id: objectIdSchema });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = parseParams(await params, paramsSchema);
    return jsonResponse(repliesResponseSchema, {
      replies: await listReplies(id),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSessionUser(request);
    const { id } = parseParams(await params, paramsSchema);
    const input = await parseJson(request, createReplyInputSchema);
    return jsonResponse(
      replyResponseSchema,
      { reply: await createReply(user, id, input) },
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}

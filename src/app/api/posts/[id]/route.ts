import { z } from "zod";
import { postResponseSchema } from "@/contracts/content";
import { objectIdSchema } from "@/contracts/common";
import { handleApiError, jsonResponse, parseParams } from "@/server/http";
import { getPost } from "@/server/services/post.service";

export const runtime = "nodejs";

const paramsSchema = z.strictObject({ id: objectIdSchema });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = parseParams(await params, paramsSchema);
    return jsonResponse(postResponseSchema, { post: await getPost(id) });
  } catch (error) {
    return handleApiError(error);
  }
}

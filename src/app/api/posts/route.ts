import { NextRequest } from "next/server";
import {
  createPostInputSchema,
  listPostsQuerySchema,
  postResponseSchema,
  postsResponseSchema,
} from "@/contracts/content";
import { requireSessionUser } from "@/server/auth/session";
import {
  handleApiError,
  jsonResponse,
  parseJson,
  parseQuery,
} from "@/server/http";
import { createPost, listPosts } from "@/server/services/post.service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const query = parseQuery(request.nextUrl, listPostsQuerySchema);
    return jsonResponse(postsResponseSchema, await listPosts(query));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser(request);
    const input = await parseJson(request, createPostInputSchema);
    return jsonResponse(
      postResponseSchema,
      { post: await createPost(user, input) },
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}

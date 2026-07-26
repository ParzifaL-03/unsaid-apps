import type { z } from "zod";
import {
  createPostInputSchema,
  createReplyInputSchema,
  listPostsQuerySchema,
  postResponseSchema,
  postsResponseSchema,
  reactionInputSchema,
  reactionResponseSchema,
  repliesResponseSchema,
  replyResponseSchema,
} from "@/contracts/content";
import { apiRequest } from "@/lib/api-client";

export type ListPostsQuery = Partial<z.input<typeof listPostsQuerySchema>>;
export type CreatePostInput = z.input<typeof createPostInputSchema>;
export type CreateReplyInput = z.input<typeof createReplyInputSchema>;
export type ReactionInput = z.input<typeof reactionInputSchema>;

export const postsApi = {
  list: (params?: ListPostsQuery) =>
    apiRequest("/posts", postsResponseSchema, {
      method: "GET",
      params,
      headers: { "Cache-Control": "no-store" },
    }),
  create: (data: CreatePostInput) =>
    apiRequest("/posts", postResponseSchema, { method: "POST", data }),
  get: (id: string) => apiRequest(`/posts/${id}`, postResponseSchema),
  listReplies: (id: string) =>
    apiRequest(`/posts/${id}/replies`, repliesResponseSchema, {
      headers: { "Cache-Control": "no-store" },
    }),
  createReply: (id: string, data: CreateReplyInput) =>
    apiRequest(`/posts/${id}/replies`, replyResponseSchema, {
      method: "POST",
      data,
    }),
  addReaction: (id: string, data: ReactionInput = { type: "echo" }) =>
    apiRequest(`/posts/${id}/reactions`, reactionResponseSchema, {
      method: "POST",
      data,
    }),
  removeReaction: (id: string) =>
    apiRequest(`/posts/${id}/reactions`, reactionResponseSchema, {
      method: "DELETE",
    }),
};

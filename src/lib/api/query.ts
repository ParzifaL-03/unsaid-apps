import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type { z } from "zod";
import { sessionResponseSchema } from "@/contracts/auth";
import {
  capsulesResponseSchema,
  openLettersResponseSchema,
  postResponseSchema,
  postsResponseSchema,
  repliesResponseSchema,
} from "@/contracts/content";
import { healthResponseSchema } from "@/lib/api/health";
import {
  authApi,
  capsulesApi,
  healthApi,
  moderationApi,
  openLettersApi,
  postsApi,
  type CreateCapsuleInput,
  type CreateOpenLetterInput,
  type CreatePostInput,
  type CreateReplyInput,
} from "@/lib/api";
import { ApiClientError } from "@/lib/api-client";

type SessionResponse = z.infer<typeof sessionResponseSchema>;
type PostsResponse = z.infer<typeof postsResponseSchema>;
type PostResponse = z.infer<typeof postResponseSchema>;
type RepliesResponse = z.infer<typeof repliesResponseSchema>;
type OpenLettersResponse = z.infer<typeof openLettersResponseSchema>;
type CapsulesResponse = z.infer<typeof capsulesResponseSchema>;
type HealthResponse = z.infer<typeof healthResponseSchema>;

export const queryKeys = {
  session: ["auth", "session"] as const,
  healthDatabase: ["health", "database"] as const,
  posts: ["posts"] as const,
  post: (id: string) => ["posts", id] as const,
  replies: (postId: string) => ["posts", postId, "replies"] as const,
  openLetters: ["open-letters"] as const,
  capsules: ["capsules"] as const,
};

export function clearAuthenticatedCache(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: queryKeys.capsules });
}

export function useSessionQuery() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: async () => {
      try {
        return await authApi.session();
      } catch (error) {
        if (error instanceof ApiClientError && error.statusCode === 401) {
          return { account: null };
        }

        throw error;
      }
    },
    retry: (failureCount, error) =>
      error instanceof ApiClientError && error.statusCode === 401
        ? false
        : failureCount < 1,
  });
}

export function useHealthDatabaseQuery() {
  return useQuery<HealthResponse>({
    queryKey: queryKeys.healthDatabase,
    queryFn: healthApi.database,
    retry: 1,
  });
}

export function useRotateAliasMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.rotateAlias,
    onSuccess: (data) => {
      queryClient.setQueryData<SessionResponse>(queryKeys.session, {
        account: data.account,
      });
    },
  });
}

export function useSignOutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signOut,
    onSuccess: () => {
      queryClient.setQueryData<SessionResponse>(queryKeys.session, {
        account: null,
      });
      clearAuthenticatedCache(queryClient);
    },
  });
}

export function usePostsQuery() {
  return useQuery({
    queryKey: queryKeys.posts,
    queryFn: () => postsApi.list(),
  });
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: CreatePostInput) => postsApi.create(post),
    onSuccess: (data) => {
      queryClient.setQueryData<PostsResponse>(queryKeys.posts, (current) => {
        if (!current) {
          return { posts: [data.post], nextCursor: null };
        }

        return {
          ...current,
          posts: [data.post, ...current.posts],
        };
      });
    },
  });
}

export function useEchoPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsApi.addReaction(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData<PostsResponse>(queryKeys.posts, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          posts: current.posts.map((post) =>
            post.id === id ? { ...post, echoes: data.count } : post,
          ),
        };
      });
      queryClient.setQueryData<PostResponse>(queryKeys.post(id), (current) => {
        if (!current) {
          return current;
        }

        return { post: { ...current.post, echoes: data.count } };
      });
    },
  });
}

export function useRemoveEchoPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsApi.removeReaction(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData<PostsResponse>(queryKeys.posts, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          posts: current.posts.map((post) =>
            post.id === id ? { ...post, echoes: data.count } : post,
          ),
        };
      });
      queryClient.setQueryData<PostResponse>(queryKeys.post(id), (current) => {
        if (!current) {
          return current;
        }

        return { post: { ...current.post, echoes: data.count } };
      });
    },
  });
}

export function usePostQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.post(id),
    queryFn: () => postsApi.get(id),
  });
}

export function useRepliesQuery(postId: string) {
  return useQuery({
    queryKey: queryKeys.replies(postId),
    queryFn: () => postsApi.listReplies(postId),
  });
}

export function useCreateReplyMutation(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reply: CreateReplyInput) =>
      postsApi.createReply(postId, reply),
    onSuccess: (data) => {
      queryClient.setQueryData<RepliesResponse>(
        queryKeys.replies(postId),
        (current) => {
          if (!current) {
            return { replies: [data.reply] };
          }

          return { replies: [...current.replies, data.reply] };
        },
      );
      queryClient.setQueryData<PostResponse>(
        queryKeys.post(postId),
        (current) => {
          if (!current) {
            return current;
          }

          return {
            post: {
              ...current.post,
              replies: current.post.replies + 1,
            },
          };
        },
      );
      queryClient.setQueryData<PostsResponse>(queryKeys.posts, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          posts: current.posts.map((post) =>
            post.id === postId ? { ...post, replies: post.replies + 1 } : post,
          ),
        };
      });
    },
  });
}

export function useOpenLettersQuery() {
  return useQuery({
    queryKey: queryKeys.openLetters,
    queryFn: openLettersApi.list,
  });
}

export function useCreateOpenLetterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (letter: CreateOpenLetterInput) =>
      openLettersApi.create(letter),
    onSuccess: (data) => {
      queryClient.setQueryData<OpenLettersResponse>(
        queryKeys.openLetters,
        (current) => {
          if (!current) {
            return { letters: [data.letter] };
          }

          return { letters: [data.letter, ...current.letters] };
        },
      );
    },
  });
}

export function useCapsulesQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.capsules,
    queryFn: capsulesApi.list,
    enabled,
  });
}

export function useCreateCapsuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (capsule: CreateCapsuleInput) => capsulesApi.create(capsule),
    onSuccess: (data) => {
      queryClient.setQueryData<CapsulesResponse>(
        queryKeys.capsules,
        (current) => {
          if (!current) {
            return { capsules: [data.capsule] };
          }

          return { capsules: [data.capsule, ...current.capsules] };
        },
      );
    },
  });
}

export function usePublishCapsuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => capsulesApi.publish(id),
    onSuccess: (data) => {
      queryClient.setQueryData<CapsulesResponse>(
        queryKeys.capsules,
        (current) => {
          if (!current) {
            return { capsules: [data.capsule] };
          }

          return {
            capsules: current.capsules.map((capsule) =>
              capsule.id === data.capsule.id ? data.capsule : capsule,
            ),
          };
        },
      );

      if (data.capsule.publishedPostId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.posts });
        queryClient.invalidateQueries({
          queryKey: queryKeys.post(data.capsule.publishedPostId),
        });
      }
    },
  });
}

export function useReportMutation() {
  return useMutation({
    mutationFn: moderationApi.report,
  });
}

export function useBlockUserMutation() {
  return useMutation({
    mutationFn: moderationApi.block,
  });
}

export function useUnblockUserMutation() {
  return useMutation({
    mutationFn: moderationApi.unblock,
  });
}

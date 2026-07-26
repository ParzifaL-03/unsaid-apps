"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  type CreatePostInput,
} from "@/lib/api";
import {
  useCreatePostMutation,
  useEchoPostMutation,
  usePostsQuery,
} from "@/lib/api/query";
import type { AnonymousPost, Mood } from "@/types/post";

type NewPost = CreatePostInput & {
  body: string;
  topic: string;
  mood: Mood;
};

type PostContextValue = {
  posts: AnonymousPost[];
  isLoading: boolean;
  addPost: (post: NewPost) => Promise<AnonymousPost>;
  echoPost: (id: string) => Promise<void>;
};

const PostContext = createContext<PostContextValue | null>(null);
const EMPTY_POSTS: AnonymousPost[] = [];

export function PostProvider({ children }: { children: ReactNode }) {
  const postsQuery = usePostsQuery();
  const createPostMutation = useCreatePostMutation();
  const echoPostMutation = useEchoPostMutation();
  const posts = postsQuery.data?.posts ?? EMPTY_POSTS;

  const addPost = useCallback(async (post: NewPost) => {
    const data = await createPostMutation.mutateAsync(post);
    return data.post;
  }, [createPostMutation]);

  const echoPost = useCallback(async (id: string) => {
    await echoPostMutation.mutateAsync(id);
  }, [echoPostMutation]);

  const value = useMemo<PostContextValue>(
    () => ({
      posts,
      isLoading: postsQuery.isPending,
      addPost,
      echoPost,
    }),
    [addPost, echoPost, posts, postsQuery.isPending],
  );

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const value = useContext(PostContext);
  if (!value) throw new Error("usePosts must be used within PostProvider");
  return value;
}

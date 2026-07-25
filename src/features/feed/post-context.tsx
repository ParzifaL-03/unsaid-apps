"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  postResponseSchema,
  postsResponseSchema,
  reactionResponseSchema,
} from "@/contracts/content";
import { apiFetch, getApiError } from "@/lib/api-client";
import type { AnonymousPost, Mood } from "@/types/post";

type NewPost = {
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

export function PostProvider({ children }: { children: ReactNode }) {
  const [customPosts, setCustomPosts] = useState<AnonymousPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void (async () => {
        try {
          const response = await apiFetch("/posts", { cache: "no-store" });
          if (response.ok) {
            const data = postsResponseSchema.parse(await response.json());
            setCustomPosts(data.posts);
          }
        } finally {
          setIsLoading(false);
        }
      })();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const addPost = useCallback(async (post: NewPost) => {
    const response = await apiFetch("/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      throw new Error(
        await getApiError(response, "Unable to publish anonymous post."),
      );
    }

    const data = postResponseSchema.parse(await response.json());
    setCustomPosts((current) => [data.post, ...current]);
    return data.post;
  }, []);

  const echoPost = useCallback(async (id: string) => {
    const response = await apiFetch(`/posts/${id}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "echo" }),
    });
    if (!response.ok) {
      throw new Error(await getApiError(response, "Unable to echo this post."));
    }
    const result = reactionResponseSchema.parse(await response.json());
    setCustomPosts((current) =>
      current.map((post) =>
        post.id === id ? { ...post, echoes: result.count } : post,
      ),
    );
  }, []);

  const value = useMemo<PostContextValue>(
    () => ({
      posts: customPosts,
      isLoading,
      addPost,
      echoPost,
    }),
    [addPost, customPosts, echoPost, isLoading],
  );

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const value = useContext(PostContext);
  if (!value) throw new Error("usePosts must be used within PostProvider");
  return value;
}

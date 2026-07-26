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
  postsApi,
  type CreatePostInput,
} from "@/lib/api";
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

export function PostProvider({ children }: { children: ReactNode }) {
  const [customPosts, setCustomPosts] = useState<AnonymousPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void (async () => {
        try {
          const data = await postsApi.list();
          setCustomPosts(data.posts);
        } finally {
          setIsLoading(false);
        }
      })();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const addPost = useCallback(async (post: NewPost) => {
    const data = await postsApi.create(post);
    setCustomPosts((current) => [data.post, ...current]);
    return data.post;
  }, []);

  const echoPost = useCallback(async (id: string) => {
    const result = await postsApi.addReaction(id);
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

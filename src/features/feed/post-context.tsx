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
import { seedPosts } from "@/features/feed/data/posts";
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
  echoPost: (id: string) => void;
};

const PostContext = createContext<PostContextValue | null>(null);
const ECHO_STORAGE_KEY = "unsaid-echo-counts";

export function PostProvider({ children }: { children: ReactNode }) {
  const [customPosts, setCustomPosts] = useState<AnonymousPost[]>([]);
  const [echoCounts, setEchoCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void (async () => {
        try {
          const response = await fetch("/api/posts", { cache: "no-store" });
          if (response.ok) {
            const data = (await response.json()) as { posts: AnonymousPost[] };
            setCustomPosts(data.posts);
          }
        } finally {
          setIsLoading(false);
        }
      })();

      const savedEchoes = window.localStorage.getItem(ECHO_STORAGE_KEY);
      if (savedEchoes) {
        try {
          setEchoCounts(JSON.parse(savedEchoes) as Record<string, number>);
        } catch {
          window.localStorage.removeItem(ECHO_STORAGE_KEY);
        }
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const addPost = useCallback(async (post: NewPost) => {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(data?.error ?? "Unable to publish anonymous post.");
    }

    const data = (await response.json()) as { post: AnonymousPost };
    setCustomPosts((current) => [data.post, ...current]);
    return data.post;
  }, []);

  const value = useMemo<PostContextValue>(
    () => ({
      posts: [...customPosts, ...seedPosts].map((post) => ({
        ...post,
        echoes: post.echoes + (echoCounts[post.id] ?? 0),
      })),
      isLoading,
      addPost,
      echoPost: (id) => {
        setEchoCounts((current) => {
          const next = { ...current, [id]: (current[id] ?? 0) + 1 };
          window.localStorage.setItem(ECHO_STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      },
    }),
    [addPost, customPosts, echoCounts, isLoading],
  );

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const value = useContext(PostContext);
  if (!value) throw new Error("usePosts must be used within PostProvider");
  return value;
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedPosts } from "@/features/feed/data/posts";
import type { AnonymousPost, Mood } from "@/types/post";

type NewPost = {
  alias: string;
  body: string;
  topic: string;
  mood: Mood;
};

type PostContextValue = {
  posts: AnonymousPost[];
  addPost: (post: NewPost) => AnonymousPost;
  echoPost: (id: string) => void;
};

const PostContext = createContext<PostContextValue | null>(null);
const STORAGE_KEY = "unsaid-custom-posts";
const ECHO_STORAGE_KEY = "unsaid-echo-counts";

export function PostProvider({ children }: { children: ReactNode }) {
  const [customPosts, setCustomPosts] = useState<AnonymousPost[]>([]);
  const [echoCounts, setEchoCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const savedEchoes = window.localStorage.getItem(ECHO_STORAGE_KEY);

      if (saved) {
        try {
          setCustomPosts(JSON.parse(saved) as AnonymousPost[]);
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }

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

  const value = useMemo<PostContextValue>(
    () => ({
      posts: [...customPosts, ...seedPosts].map((post) => ({
        ...post,
        echoes: post.echoes + (echoCounts[post.id] ?? 0),
      })),
      addPost: (post) => {
        const created: AnonymousPost = {
          ...post,
          id: `local-${Date.now()}`,
          createdAt: "just now",
          echoes: 0,
          replies: 0,
        };
        setCustomPosts((current) => {
          const next = [created, ...current];
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
        return created;
      },
      echoPost: (id) => {
        setEchoCounts((current) => {
          const next = { ...current, [id]: (current[id] ?? 0) + 1 };
          window.localStorage.setItem(ECHO_STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      },
    }),
    [customPosts, echoCounts],
  );

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const value = useContext(PostContext);
  if (!value) throw new Error("usePosts must be used within PostProvider");
  return value;
}

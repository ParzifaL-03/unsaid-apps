"use client";

import Link from "next/link";
import { MessageCircle, Radio, Repeat2 } from "lucide-react";
import { useState } from "react";
import { Avatar, Card, Chip } from "@/components/ui";
import { useAuth } from "@/features/auth/auth-context";
import { AuthDialog } from "@/features/auth/components/auth-dialog";
import { cn } from "@/lib/utils";
import type { AnonymousPost } from "@/types/post";

export function AnonymousPostCard({
  post,
  compact = false,
  onEcho,
}: {
  post: AnonymousPost;
  compact?: boolean;
  onEcho?: (id: string) => Promise<void>;
}) {
  const { account } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [isEchoing, setIsEchoing] = useState(false);
  const [echoError, setEchoError] = useState("");

  const echo = async () => {
    if (!account) {
      setAuthOpen(true);
      return;
    }
    if (!onEcho || isEchoing) return;

    setEchoError("");
    setIsEchoing(true);
    try {
      await onEcho(post.id);
    } catch {
      setEchoError("Could not echo this post. Please try again.");
    } finally {
      setIsEchoing(false);
    }
  };

  return (
    <>
      <Card
        className={cn(
          "group w-full overflow-hidden transition-transform duration-200 hover:-translate-y-0.5",
          compact ? "p-5" : "p-5 sm:p-7",
        )}
      >
        <div className="flex items-center gap-3">
          <Avatar alias={post.alias} size={compact ? "sm" : "md"} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{post.alias}</p>
            <p className="text-xs font-medium tracking-[0.02em] text-muted">
              {post.createdAt} • #{post.topic}
            </p>
          </div>
        </div>

        <Link
          href={`/post/${post.id}`}
          className={cn(
            "mt-5 block font-medium leading-7 text-ink",
            compact ? "text-base" : "text-base sm:text-lg",
          )}
        >
          {post.body}
        </Link>

        <div className="mt-6 flex flex-wrap gap-2">
          <Chip variant="topic">#{post.topic}</Chip>
          <Chip variant="mood">feeling {post.mood}</Chip>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={echo}
            disabled={isEchoing}
            aria-label={
              account
                ? `Echo post by ${post.alias}`
                : "Log in with Google to echo this post"
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-coral px-3 text-xs font-medium transition-transform active:scale-95"
          >
            <Repeat2 className="size-3.5" aria-hidden="true" />
            {isEchoing ? "Echoing..." : `Echo ${post.echoes}`}
          </button>
          <Link
            href={`/post/${post.id}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-orange px-3 text-xs font-medium"
          >
            <MessageCircle className="size-3.5" aria-hidden="true" />
            Replies {post.replies}
          </Link>
          {!compact ? (
            <span className="ml-auto hidden items-center gap-1.5 text-xs font-medium text-muted sm:inline-flex">
              <Radio className="size-3.5" />
              Anonymous thread
            </span>
          ) : null}
        </div>
        {echoError ? (
          <p className="mt-3 text-xs font-medium text-danger" role="alert">
            {echoError}
          </p>
        ) : null}
      </Card>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}

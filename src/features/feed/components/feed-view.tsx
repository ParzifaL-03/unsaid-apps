"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ContextRail } from "@/components/layout/context-rail";
import { AnonymousPostCard } from "@/components/shared/anonymous-post-card";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, Chip, Input } from "@/components/ui";
import { usePosts } from "@/features/feed/post-context";
import { cn } from "@/lib/utils";

const filters = ["For you", "Latest", "Heavy", "Future replies"] as const;

export function FeedView({ authError }: { authError?: string }) {
  const { posts, echoPost } = usePosts();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("For you");

  const filteredPosts = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return posts.filter((post) => {
      const matchesSearch =
        !normalized ||
        [post.alias, post.body, post.topic, post.mood].some((value) =>
          value.toLowerCase().includes(normalized),
        );
      const matchesFilter = activeFilter !== "Heavy" || post.mood === "heavy";
      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, posts, query]);

  return (
    <div className="mx-auto grid w-full max-w-[1320px] gap-6 px-5 py-6 sm:px-8 md:py-9 xl:grid-cols-[minmax(0,760px)_360px] xl:px-10">
      <section className="min-w-0">
        <PageHeader
          title="What stays unsaid today?"
          description="A feed of thoughts, moods, and open letters — without names attached."
        />

        {authError ? (
          <Alert
            className="mt-6"
            title="Google login could not start"
            description={
              authError === "missing-google-config"
                ? "Complete GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET, and NEXT_PUBLIC_APP_URL in .env.local, then restart the dev server."
                : "Check the development terminal for the OAuth error and try again."
            }
            variant="danger"
          />
        ) : null}

        <div className="relative mt-6">
          <Search
            className="pointer-events-none absolute left-4 top-[42px] size-4 text-muted"
            aria-hidden="true"
          />
          <Input
            label="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search thoughts, moods, or topics"
            className="pl-11"
          />
        </div>

        <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
          {filters.map((filter, index) => (
            <Chip
              key={filter}
              variant={
                activeFilter === filter
                  ? "selected"
                  : index === 2
                    ? "mood"
                    : index === 3
                      ? "capsule"
                      : "topic"
              }
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={cn(activeFilter === filter && "ring-2 ring-ink/10")}
            >
              {filter}
            </Chip>
          ))}
        </div>

        <div className="mt-4 grid gap-4">
          {filteredPosts.length ? (
            filteredPosts.map((post) => (
              <AnonymousPostCard key={post.id} post={post} onEcho={echoPost} />
            ))
          ) : (
            <div className="rounded-[24px] bg-surface p-8 text-center">
              <p className="text-lg font-bold">Nothing matching that yet.</p>
              <p className="mt-2 text-sm text-muted">
                Try a different mood, topic, or phrase.
              </p>
            </div>
          )}
        </div>
      </section>
      <ContextRail />
    </div>
  );
}

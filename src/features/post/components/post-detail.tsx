"use client";

import { Flag, LockKeyhole, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { AnonymousPostCard } from "@/components/shared/anonymous-post-card";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, Button, Card, Textarea } from "@/components/ui";
import { usePosts } from "@/features/feed/post-context";

const replies = [
  {
    alias: "soft thunder",
    body: "You are allowed to say it badly before you learn how to say it clearly.",
    className: "bg-orange",
  },
  {
    alias: "north window",
    body: "I felt this. Silence can protect us and still hurt us at the same time.",
    className: "bg-coral",
  },
];

export function PostDetail({ id }: { id: string }) {
  const { posts, echoPost } = usePosts();
  const post = useMemo(
    () => posts.find((item) => item.id === id) ?? posts[0],
    [id, posts],
  );
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-6 sm:px-8 md:py-10 xl:px-14">
      <PageHeader
        eyebrow="Anonymous conversation"
        title="Expression & replies"
        description="Respond to the words without asking for the identity behind them."
      />

      <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,760px)_340px]">
        <section className="min-w-0">
          <AnonymousPostCard post={post} onEcho={echoPost} />

          <h2 className="mt-8 text-2xl font-bold tracking-[-0.5px]">
            Anonymous replies
          </h2>
          <div className="mt-4 grid gap-3">
            {replies.map((item) => (
              <Card
                key={item.alias}
                className={`border-0 p-5 ${item.className}`}
              >
                <p className="text-sm font-semibold">{item.alias}</p>
                <p className="mt-3 text-sm leading-6">{item.body}</p>
              </Card>
            ))}
            {sent ? (
              <Alert
                title="Reply sent anonymously"
                description={reply}
                variant="success"
              />
            ) : null}
          </div>
        </section>

        <aside className="space-y-4">
          <Card className="border-0 bg-teal p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.08em]">
              Conversation controls
            </p>
            <div className="mt-6 grid gap-3 text-sm">
              <p>Public replies: On</p>
              <p>Private replies: On</p>
              <p>Future reply: Available</p>
            </div>
          </Card>
          <Textarea
            label="Reply anonymously"
            value={reply}
            onChange={(event) => {
              setReply(event.target.value);
              setSent(false);
            }}
            placeholder="Write something kind, useful, or honest…"
            className="min-h-32"
          />
          <Button
            variant="secondary"
            fullWidth
            disabled={!reply.trim()}
            onClick={() => setSent(true)}
          >
            <Send className="size-4" />
            Send anonymous reply
          </Button>
          <Button variant="ghost" fullWidth>
            <LockKeyhole className="size-4" />
            Private reply
          </Button>
          <Button variant="ghost" fullWidth className="text-red-700">
            <Flag className="size-4" />
            Report expression
          </Button>
        </aside>
      </div>
    </div>
  );
}

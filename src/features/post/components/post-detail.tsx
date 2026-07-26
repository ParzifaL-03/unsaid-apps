"use client";

import { Flag, LockKeyhole, Send } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { AnonymousPostCard } from "@/components/shared/anonymous-post-card";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, Button, Card, Textarea } from "@/components/ui";
import { AuthDialog } from "@/features/auth/components/auth-dialog";
import { useAuth } from "@/features/auth/auth-context";
import { usePosts } from "@/features/feed/post-context";
import {
  useCreateReplyMutation,
  usePostQuery,
  useRepliesQuery,
  useReportMutation,
} from "@/lib/api/query";

export function PostDetail({ id }: { id: string }) {
  const { account } = useAuth();
  const { posts, echoPost } = usePosts();
  const initialPost = useMemo(
    () => posts.find((item) => item.id === id),
    [id, posts],
  );
  const postQuery = usePostQuery(id);
  const repliesQuery = useRepliesQuery(id);
  const createReplyMutation = useCreateReplyMutation(id);
  const reportMutation = useReportMutation();
  const post = postQuery.data?.post ?? initialPost;
  const replies = repliesQuery.data?.replies ?? [];
  const [reply, setReply] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [error, setError] = useState("");
  const [reported, setReported] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const loadError = postQuery.error ?? repliesQuery.error;
  const isLoading = !initialPost && (postQuery.isPending || repliesQuery.isPending);

  const sendReply = useCallback(async () => {
    if (!account || account.provider !== "google") {
      setAuthOpen(true);
      return;
    }
    setError("");
    try {
      await createReplyMutation.mutateAsync({ body: reply, visibility });
      setReply("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to send reply.",
      );
    }
  }, [account, createReplyMutation, reply, visibility]);

  const reportPost = useCallback(async () => {
    if (!account || account.provider !== "google") {
      setAuthOpen(true);
      return;
    }

    setError("");
    try {
      await reportMutation.mutateAsync({
        targetType: "post",
        targetId: id,
        reason: "other",
      });
      setReported(true);
    } catch (reportError) {
      setError(
        reportError instanceof Error
          ? reportError.message
          : "Unable to report this expression.",
      );
    }
  }, [account, id, reportMutation]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Card className="p-8 text-center">Loading conversation…</Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Alert
          title="Conversation unavailable"
          description={
            error ||
            (loadError instanceof Error ? loadError.message : "") ||
            "This expression may have been removed."
          }
          variant="danger"
        />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1180px] px-5 py-6 sm:px-8 md:py-10 xl:px-14">
        <PageHeader
          eyebrow="Anonymous conversation"
          title="Expression & replies"
          description="Respond to the words without asking for the identity behind them."
        />

        <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,760px)_340px]">
          <section className="min-w-0">
            <AnonymousPostCard
              post={post}
              onEcho={async (postId) => {
                try {
                  await echoPost(postId);
                } catch (echoError) {
                  setError(
                    echoError instanceof Error
                      ? echoError.message
                      : "Unable to echo this post.",
                  );
                }
              }}
            />

            <h2 className="mt-8 text-2xl font-bold tracking-[-0.5px]">
              Anonymous replies
            </h2>
            <div className="mt-4 grid gap-3">
              {replies.length ? (
                replies.map((item, index) => (
                  <Card
                    key={item.id}
                    className={`border-0 p-5 ${
                      index % 2 ? "bg-coral" : "bg-orange"
                    }`}
                  >
                    <p className="text-sm font-semibold">{item.alias}</p>
                    <p className="mt-3 text-sm leading-6">{item.body}</p>
                  </Card>
                ))
              ) : (
                <Card className="p-5 text-sm text-muted">
                  No replies yet. You can be the first.
                </Card>
              )}
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
                <p>Your identity stays hidden behind your alias.</p>
              </div>
            </Card>
            <Textarea
              label="Reply anonymously"
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Write something kind, useful, or honest…"
              className="min-h-32"
              maxLength={1200}
            />
            {error ? (
              <Alert
                title="Unable to continue"
                description={error}
                variant="danger"
              />
            ) : null}
            <Button
              variant="secondary"
              fullWidth
              disabled={reply.trim().length < 2 || createReplyMutation.isPending}
              onClick={() => void sendReply()}
            >
              <Send className="size-4" />
              {createReplyMutation.isPending ? "Sending…" : "Send public reply"}
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() =>
                setVisibility((current) =>
                  current === "private" ? "public" : "private",
                )
              }
            >
              <LockKeyhole className="size-4" />
              {visibility === "private"
                ? "Private reply selected"
                : "Switch to private reply"}
            </Button>
            {reported ? (
              <Alert
                title="Report sent"
                description="Thanks. The moderation queue can now review this expression."
                variant="success"
              />
            ) : null}
            <Button
              variant="ghost"
              fullWidth
              className="text-red-700"
              disabled={reportMutation.isPending || reported}
              onClick={() => void reportPost()}
            >
              <Flag className="size-4" />
              {reportMutation.isPending
                ? "Reporting..."
                : reported
                  ? "Expression reported"
                  : "Report expression"}
            </Button>
          </aside>
        </div>
      </div>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}

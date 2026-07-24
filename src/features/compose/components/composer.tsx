"use client";

import { useRouter } from "next/navigation";
import { CalendarClock, LockKeyhole, Send, ShieldCheck } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { capsuleResponseSchema } from "@/contracts/content";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, Button, Card, Chip, Input, Textarea } from "@/components/ui";
import { AuthDialog } from "@/features/auth/components/auth-dialog";
import { useAuth } from "@/features/auth/auth-context";
import { usePosts } from "@/features/feed/post-context";
import { getApiError } from "@/lib/api-client";
import type { Mood } from "@/types/post";

type PublishMode = "now" | "schedule" | "seal";

export function Composer() {
  const router = useRouter();
  const { account } = useAuth();
  const { addPost } = usePosts();
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState<PublishMode>("now");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState("relationships");
  const [mood, setMood] = useState<Mood>("quiet");
  const [error, setError] = useState("");
  const [releaseAt, setReleaseAt] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modeDescription = useMemo(
    () =>
      ({
        now: "Your expression appears in the anonymous feed immediately.",
        schedule: "Choose when the expression should appear.",
        seal: "Keep it closed until a date you choose.",
      })[mode],
    [mode],
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!account || account.provider !== "google") {
      setAuthOpen(true);
      return;
    }
    if (body.trim().length < 12) {
      setError("Write at least 12 characters so the expression has context.");
      return;
    }
    if (mode !== "now" && !releaseAt) {
      setError("Choose when this capsule should unlock.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "now") {
        await addPost({
          body: body.trim(),
          topic: topic.trim().replace(/^#/, "") || "unsaid",
          mood,
        });
        router.push("/");
      } else {
        const response = await fetch("/api/capsules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: body.trim(),
            topic: topic.trim().replace(/^#/, "") || "unsaid",
            mood,
            unlockAt: new Date(releaseAt).toISOString(),
            visibility: mode === "seal" ? "private" : "public",
          }),
        });
        if (!response.ok) {
          throw new Error(
            await getApiError(response, "Unable to save this capsule."),
          );
        }
        capsuleResponseSchema.parse(await response.json());
        router.push("/capsules");
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to publish anonymous post.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-[1100px] px-5 py-6 sm:px-8 md:py-10 xl:px-14">
        <PageHeader
          eyebrow="New expression"
          title="What do you need to let out?"
          description="No real name. No follower count. Just the words."
        />

        <form onSubmit={submit} className="mt-7 grid gap-5">
          <div className="flex flex-wrap gap-2">
            <Chip
              variant={mode === "now" ? "selected" : "neutral"}
              onClick={() => setMode("now")}
            >
              <Send className="mr-1 size-3.5" />
              Post now
            </Chip>
            <Chip
              variant={mode === "schedule" ? "selected" : "topic"}
              onClick={() => setMode("schedule")}
            >
              <CalendarClock className="mr-1 size-3.5" />
              Schedule
            </Chip>
            <Chip
              variant={mode === "seal" ? "selected" : "capsule"}
              onClick={() => setMode("seal")}
            >
              <LockKeyhole className="mr-1 size-3.5" />
              Seal as capsule
            </Chip>
          </div>

          <p className="text-sm text-muted">{modeDescription}</p>

          <Textarea
            label="Your anonymous expression"
            placeholder="What have you never said out loud?"
            value={body}
            onChange={(event) => {
              setBody(event.target.value);
              setDraftSaved(false);
              if (error) setError("");
            }}
            error={error}
            className="min-h-[240px]"
            maxLength={1200}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="relationships"
            />
            <label className="grid gap-2 text-sm font-semibold">
              Mood
              <select
                value={mood}
                onChange={(event) => setMood(event.target.value as Mood)}
                className="min-h-[52px] rounded-2xl border border-border bg-surface px-4 font-normal outline-none focus:border-ink focus:ring-4 focus:ring-lavender/20"
              >
                <option value="quiet">Quiet</option>
                <option value="heavy">Heavy</option>
                <option value="hopeful">Hopeful</option>
                <option value="nostalgic">Nostalgic</option>
              </select>
            </label>
          </div>

          {mode !== "now" ? (
            <Input
              label={mode === "seal" ? "Unlock date" : "Publish date"}
              type="datetime-local"
              value={releaseAt}
              onChange={(event) => {
                setReleaseAt(event.target.value);
                if (error) setError("");
              }}
            />
          ) : null}

          <Alert
            title="Anonymous by default"
            description="Avoid names, addresses, and identifying details. Reply controls can be changed before posting."
            variant="success"
            className="max-w-3xl"
          />

          {!account || account.provider !== "google" ? (
            <Alert
              title="Gmail login is required to publish"
              description="Reading stays open to everyone. Gmail login keeps private accountability while posts show only your alias."
              variant="warning"
              className="max-w-3xl"
            />
          ) : (
            <Card className="max-w-3xl border-0 bg-canvas p-4">
              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck className="size-5 text-teal" />
                Posting publicly as <strong>{account.alias}</strong>
              </div>
            </Card>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : account?.provider !== "google"
                  ? "Login with Gmail to continue"
                  : mode === "now"
                    ? "Post anonymously"
                    : mode === "seal"
                      ? "Seal capsule"
                      : "Schedule expression"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => {
                window.localStorage.setItem(
                  "unsaid-draft",
                  JSON.stringify({ body, topic, mood, mode, releaseAt }),
                );
                setDraftSaved(true);
              }}
            >
              Save draft locally
            </Button>
          </div>
          {draftSaved ? (
            <Alert
              title="Draft saved on this device"
              description="It stays in this browser and is not published."
              variant="success"
              className="max-w-3xl"
            />
          ) : null}
        </form>
      </div>
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={() => setError("")}
      />
    </>
  );
}

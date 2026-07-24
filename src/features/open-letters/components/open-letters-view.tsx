"use client";

import { Mail, Send, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, Button, Card, Input, Textarea } from "@/components/ui";
import { AuthDialog } from "@/features/auth/components/auth-dialog";
import { useAuth } from "@/features/auth/auth-context";
import { useOpenLetters } from "@/features/open-letters/open-letter-context";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function OpenLettersView() {
  const { account, isHydrated } = useAuth();
  const { letters, addLetter, isLoading } = useOpenLetters();
  const [authOpen, setAuthOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientLabel, setRecipientLabel] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(false);

    if (!account || account.provider !== "google") {
      setAuthOpen(true);
      return;
    }

    if (!isValidEmail(recipientEmail)) {
      setError("Enter a valid recipient email address.");
      return;
    }

    if (subject.trim().length < 4) {
      setError("Write a short subject for this letter.");
      return;
    }

    if (body.trim().length < 20) {
      setError("Write at least 20 characters before sending.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addLetter({
        recipientEmail: recipientEmail.trim().toLowerCase(),
        recipientLabel: recipientLabel.trim() || "someone",
        subject: subject.trim(),
        body: body.trim(),
      });

      setRecipientEmail("");
      setRecipientLabel("");
      setSubject("");
      setBody("");
      setError("");
      setSent(true);
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Unable to send open letter.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-[1180px] px-5 py-6 sm:px-8 md:py-10 xl:px-14">
        <PageHeader
          eyebrow="Open letters"
          title="Send a message without revealing yourself"
          description="Address a letter by email while your public sender identity stays anonymous."
        />

        <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <form onSubmit={submit} className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Recipient email"
                type="email"
                autoComplete="email"
                placeholder="their-email@example.com"
                value={recipientEmail}
                onChange={(event) => {
                  setRecipientEmail(event.target.value);
                  if (error) setError("");
                }}
              />
              <Input
                label="Recipient label"
                placeholder="old friend, teammate, future me"
                value={recipientLabel}
                onChange={(event) => setRecipientLabel(event.target.value)}
              />
            </div>

            <Input
              label="Subject"
              placeholder="What this letter is about"
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                if (error) setError("");
              }}
              maxLength={80}
            />

            <Textarea
              label="Letter"
              placeholder="Write the words you could not send directly."
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                if (error) setError("");
              }}
              className="min-h-[260px]"
              maxLength={2000}
            />

            {error ? (
              <Alert
                title="Check your letter"
                description={error}
                variant="danger"
              />
            ) : null}

            {sent ? (
              <Alert
                title="Open letter saved"
                description="The recipient email is attached to the letter, but the sender shown in the app remains anonymous."
                variant="success"
              />
            ) : null}

            {(!account || account.provider !== "google") && isHydrated ? (
              <Alert
                title="Gmail login required"
                description="Sign in with Gmail first so the backend can keep accountability private while storing only your alias on the letter."
                variant="warning"
              />
            ) : (
              <Card className="border-0 bg-canvas p-4">
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck
                    className="size-5 text-teal"
                    aria-hidden="true"
                  />
                  Sender shown as{" "}
                  <strong>{account?.alias ?? "your anonymous alias"}</strong>
                </div>
              </Card>
            )}

            <Button type="submit" size="lg" className="w-fit">
              <Send className="size-4" aria-hidden="true" />
              {isSubmitting
                ? "Sending..."
                : account?.provider === "google"
                  ? "Send anonymous letter"
                  : "Login with Gmail to send"}
            </Button>
          </form>

          <aside className="grid content-start gap-4">
            <Card className="border-0 bg-lavender p-6 text-white">
              <Mail className="size-6" aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-bold tracking-[-0.5px]">
                Email-directed, alias-signed
              </h2>
              <p className="mt-3 text-sm leading-6 opacity-90">
                Letters are organized by recipient email. Other people only see
                the anonymous alias you use across UNSAID.
              </p>
            </Card>

            <div>
              <h2 className="text-lg font-bold">Recent open letters</h2>
              <div className="mt-3 grid gap-3">
                {isLoading ? (
                  <Card className="p-4">
                    <p className="text-sm leading-6 text-muted">
                      Loading open letters...
                    </p>
                  </Card>
                ) : letters.length ? (
                  letters.map((letter) => (
                    <Card key={letter.id} className="p-4">
                      <p className="truncate text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                        To {letter.recipientEmail}
                      </p>
                      <h3 className="mt-2 text-base font-bold">
                        {letter.subject}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                        {letter.body}
                      </p>
                      <p className="mt-4 text-xs font-semibold text-ink">
                        From {letter.senderAlias} ·{" "}
                        {new Date(letter.createdAt).toLocaleDateString()}
                      </p>
                    </Card>
                  ))
                ) : (
                  <Card className="p-4">
                    <p className="text-sm leading-6 text-muted">
                      No open letters yet. Send the first one by entering a
                      recipient email.
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={() => setError("")}
      />
    </>
  );
}

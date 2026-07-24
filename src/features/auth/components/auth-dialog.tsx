"use client";

import { useState, type FormEvent } from "react";
import { Alert, Button, Dialog, Input } from "@/components/ui";
import { useAuth } from "@/features/auth/auth-context";

const aliases = [
  "quiet comet",
  "paper moon",
  "soft thunder",
  "north window",
  "golden static",
];

export type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [alias, setAlias] = useState(aliases[0]);
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    signIn({ email, alias });
    setError("");
    onOpenChange(false);
    onSuccess?.();
  };

  const rotateAlias = () => {
    const currentIndex = aliases.indexOf(alias);
    setAlias(aliases[(currentIndex + 1) % aliases.length]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create your anonymous account"
      description="Your email is only used to recover your account. Other people will only see your rotating alias."
    >
      <form onSubmit={submit} className="grid gap-5">
        <Alert
          title="Anonymous to people, accountable to the platform"
          description="This keeps capsules, drafts, blocks, and moderation tied to you without exposing your real identity."
          variant="info"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={error}
        />
        <div className="rounded-[20px] bg-canvas p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            Public alias
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xl font-bold">{alias}</p>
            <Button variant="ghost" size="sm" onClick={rotateAlias}>
              Rotate alias
            </Button>
          </div>
        </div>
        <Button type="submit" fullWidth>
          Continue anonymously
        </Button>
      </form>
    </Dialog>
  );
}

"use client";

import { RotateCcw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, Avatar, Button, Card, Chip, Switch } from "@/components/ui";
import { AuthDialog } from "@/features/auth/components/auth-dialog";
import { useAuth } from "@/features/auth/auth-context";

const aliases = ["quiet comet", "soft thunder", "golden static", "north window"];

export function SafetyView() {
  const { account, signIn, isHydrated } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [privateReplies, setPrivateReplies] = useState(true);
  const [sensitiveFilter, setSensitiveFilter] = useState(true);
  const [autoDelete, setAutoDelete] = useState(false);

  const rotateAlias = () => {
    if (!account) return;
    const current = aliases.indexOf(account.alias);
    signIn({
      ...account,
      alias: aliases[(current + 1 + aliases.length) % aliases.length],
    });
  };

  if (isHydrated && !account) {
    return (
      <>
        <div className="mx-auto grid min-h-[70vh] max-w-2xl place-items-center px-5 py-10">
          <Card className="w-full p-7 text-center sm:p-10">
            <ShieldCheck className="mx-auto size-12 text-teal" />
            <h1 className="mt-5 text-3xl font-bold tracking-[-1px]">
              Your safety controls live here
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">
              Create an anonymous account to rotate your alias, control replies,
              block topics, and manage your expressions.
            </p>
            <Button className="mt-6" onClick={() => setAuthOpen(true)}>
              Create anonymous account
            </Button>
          </Card>
        </div>
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-6 sm:px-8 md:py-10 xl:px-14">
      <PageHeader
        eyebrow="Profile & safety"
        title="Your anonymous identity"
        description="Control how you appear, what reaches you, and when conversations stop."
      />

      <div className="mt-7 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-0 bg-coral p-6 sm:p-7">
          <Avatar alias={account?.alias ?? "quiet comet"} size="lg" />
          <h2 className="mt-5 text-2xl font-bold tracking-[-0.5px]">
            {account?.alias ?? "quiet comet"}
          </h2>
          <p className="mt-4 text-sm leading-6">
            Alias rotates every 30 days
            <br />
            Member since July 2026
            <br />
            42 expressions • 318 echoes
          </p>
          <Button variant="ghost" className="mt-6" onClick={rotateAlias}>
            <RotateCcw className="size-4" />
            Rotate alias
          </Button>
        </Card>

        <Card className="p-6 sm:p-7">
          <h2 className="text-2xl font-bold tracking-[-0.5px]">Safety controls</h2>
          <div className="mt-6 grid divide-y divide-border/50">
            <SettingRow
              label="Private replies"
              description="Let people respond without entering the public thread."
              checked={privateReplies}
              onCheckedChange={setPrivateReplies}
            />
            <SettingRow
              label="Sensitive topic filter"
              description="Reduce content that may be emotionally intense."
              checked={sensitiveFilter}
              onCheckedChange={setSensitiveFilter}
            />
            <div className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm font-semibold">Blocked topics</p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Hide matching expressions across the app.
                </p>
              </div>
              <Chip variant="capsule">3 topics</Chip>
            </div>
            <SettingRow
              label="Auto-delete expressions"
              description="Remove new expressions after 30 days."
              checked={autoDelete}
              onCheckedChange={setAutoDelete}
            />
          </div>
        </Card>
      </div>

      <Alert
        className="mt-5 p-6"
        title="Privacy by design"
        description="No public follower count. No searchable real identity. Clear reporting and conversation controls stay one click away."
        variant="success"
      />
    </div>
  );
}

function SettingRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

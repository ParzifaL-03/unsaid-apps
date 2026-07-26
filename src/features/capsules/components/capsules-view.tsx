"use client";

import Link from "next/link";
import { Clock3, LockKeyhole, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Capsule } from "@/contracts/content";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, Button, buttonVariants, Card, Chip } from "@/components/ui";
import { AuthDialog } from "@/features/auth/components/auth-dialog";
import { useAuth } from "@/features/auth/auth-context";
import { capsulesApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const filters = ["All capsules", "Sealed", "Published", "Collective"] as const;

function capsuleType(capsule: Capsule) {
  if (capsule.visibility === "collective") return "Collective";
  if (capsule.status === "published") return "Published";
  return "Sealed";
}

function capsuleIcon(capsule: Capsule) {
  if (capsule.visibility === "collective") return UsersRound;
  if (capsule.status === "published") return Clock3;
  return LockKeyhole;
}

function capsuleColor(capsule: Capsule) {
  if (capsule.visibility === "collective") return "bg-teal text-white";
  if (capsule.status === "published") return "bg-orange";
  return "bg-coral";
}

export function CapsulesView() {
  const { account, isHydrated } = useAuth();
  const [active, setActive] = useState<(typeof filters)[number]>(
    "All capsules",
  );
  const [authOpen, setAuthOpen] = useState(false);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isHydrated) return;
    if (!account) return;

    void (async () => {
      setIsLoading(true);
      try {
        const data = await capsulesApi.list();
        setCapsules(data.capsules);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load capsules.",
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [account, isHydrated]);

  const filteredCapsules = useMemo(
    () =>
      capsules.filter(
        (capsule) =>
          active === "All capsules" || capsuleType(capsule) === active,
      ),
    [active, capsules],
  );

  return (
    <>
      <div className="mx-auto w-full max-w-[1240px] px-5 py-6 sm:px-8 md:py-10 xl:px-14">
        <PageHeader
          eyebrow="Time capsules"
          title="Words that need time"
          description="Schedule an expression, seal it privately, or contribute to a collective moment."
          actions={
            <Link
              href="/compose"
              className={cn(buttonVariants(), "w-full sm:w-auto")}
            >
              Create capsule
            </Link>
          }
        />

        <div className="-mx-5 mt-7 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          {filters.map((item, index) => (
            <Chip
              key={item}
              variant={
                active === item
                  ? "selected"
                  : index === 1
                    ? "capsule"
                    : index === 3
                      ? "mood"
                      : "topic"
              }
              onClick={() => setActive(item)}
            >
              {item}
            </Chip>
          ))}
        </div>

        {!account && isHydrated ? (
          <Alert
            className="mt-6"
            title="Gmail login required"
            description="Capsules are private to your anonymous account until their unlock rules allow them to appear."
            variant="warning"
          />
        ) : null}

        {error ? (
          <Alert
            className="mt-6"
            title="Unable to load capsules"
            description={error}
            variant="danger"
          />
        ) : null}

        <Card className="mt-6 border-0 bg-lavender p-7 text-white sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.08em]">
            Collective capsule
          </p>
          <h2 className="mt-5 max-w-4xl text-3xl font-bold leading-tight tracking-[-1px] sm:text-4xl">
            What do you hope changes by next year?
          </h2>
          <p className="mt-5 text-sm text-white/80">Opens 24 July 2027</p>
        </Card>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {isLoading ? (
            <Card className="p-6 text-sm text-muted">Loading capsules...</Card>
          ) : !account ? (
            <Card className="p-6">
              <p className="text-sm leading-6 text-muted">
                Create an anonymous account to view your capsules.
              </p>
              <Button className="mt-4" onClick={() => setAuthOpen(true)}>
                Create anonymous account
              </Button>
            </Card>
          ) : filteredCapsules.length ? (
            filteredCapsules.map((capsule) => {
              const Icon = capsuleIcon(capsule);
              const type = capsuleType(capsule);
              const unlockDate = new Date(capsule.unlockAt).toLocaleDateString();
              return (
                <Card
                  key={capsule.id}
                  className={`min-h-[260px] border-0 p-6 ${capsuleColor(
                    capsule,
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="size-5" />
                    <span className="text-xs font-semibold">
                      Opens {unlockDate}
                    </span>
                  </div>
                  <h3 className="mt-8 text-2xl font-bold tracking-[-0.5px]">
                    {type}
                  </h3>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] opacity-75">
                    #{capsule.topic}
                  </p>
                  <p className="mt-4 text-sm leading-6 opacity-85">
                    {capsule.body}
                  </p>
                </Card>
              );
            })
          ) : (
            <Card className="p-6 text-sm text-muted">
              No capsules in this view yet.
            </Card>
          )}
        </div>
      </div>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}

"use client";

import Link from "next/link";
import { Clock3, LockKeyhole, UsersRound } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants, Card, Chip } from "@/components/ui";
import { cn } from "@/lib/utils";

const capsules = [
  {
    title: "To future me",
    label: "Opens in 30 days",
    body: "A reminder of what I survived this month.",
    color: "bg-coral",
    type: "Sealed",
    icon: LockKeyhole,
  },
  {
    title: "If I never say it",
    label: "Scheduled tomorrow",
    body: "One message waiting for the right moment.",
    color: "bg-orange",
    type: "Scheduled",
    icon: Clock3,
  },
  {
    title: "Future reply",
    label: "Opens when answered",
    body: "Let a stranger respond from the future.",
    color: "bg-teal text-white",
    type: "Collective",
    icon: UsersRound,
  },
];

export function CapsulesView() {
  const [active, setActive] = useState("All capsules");

  return (
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
        {["All capsules", "Sealed", "Scheduled", "Collective"].map(
          (item, index) => (
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
          ),
        )}
      </div>

      <Card className="mt-6 border-0 bg-lavender p-7 text-white sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.08em]">
          Collective capsule
        </p>
        <h2 className="mt-5 max-w-4xl text-3xl font-bold leading-tight tracking-[-1px] sm:text-4xl">
          What do you hope changes by next year?
        </h2>
        <p className="mt-5 text-sm text-white/80">
          4,218 anonymous messages • Opens 24 July 2027
        </p>
      </Card>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {capsules
          .filter(
            (capsule) =>
              active === "All capsules" || capsule.type === active,
          )
          .map((capsule) => {
            const Icon = capsule.icon;
            return (
              <Card
                key={capsule.title}
                className={`min-h-[260px] border-0 p-6 ${capsule.color}`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="size-5" />
                  <span className="text-xs font-semibold">{capsule.label}</span>
                </div>
                <h3 className="mt-8 text-2xl font-bold tracking-[-0.5px]">
                  {capsule.title}
                </h3>
                <p className="mt-4 text-sm leading-6 opacity-85">
                  {capsule.body}
                </p>
              </Card>
            );
          })}
      </div>
    </div>
  );
}

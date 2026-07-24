import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";

export function ContextRail() {
  return (
    <aside className="hidden space-y-4 xl:block">
      <article className="min-h-52 rounded-[24px] bg-teal p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.08em]">
          Today&apos;s mood
        </p>
        <h2 className="mt-7 text-2xl font-bold tracking-[-0.5px]">
          Quiet, but hopeful.
        </h2>
        <p className="mt-6 text-sm leading-6 text-white/85">
          1,248 expressions share this mood
        </p>
      </article>

      <article className="min-h-52 rounded-[24px] bg-orange p-6 text-ink">
        <p className="text-xs font-semibold uppercase tracking-[0.08em]">
          Trending now
        </p>
        <div className="mt-7 grid gap-1 text-sm font-medium">
          <Link href="/explore">#relationships</Link>
          <Link href="/explore">#things-never-said</Link>
          <Link href="/explore">#starting-over</Link>
        </div>
      </article>

      <Link
        href="/capsules"
        className="group block min-h-48 rounded-[24px] bg-lavender p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <Clock3 className="size-5" />
          <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.08em]">
          Seal it for later
        </p>
        <p className="mt-3 text-sm leading-6 text-white/85">
          Write to your future self — or everyone else&apos;s.
        </p>
      </Link>
    </aside>
  );
}

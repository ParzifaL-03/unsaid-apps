"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, Input } from "@/components/ui";

const topics = [
  {
    title: "Things never said",
    count: "12.8k expressions",
    description: "Words held back from family, friends, and people we once loved.",
    className: "bg-coral",
  },
  {
    title: "Starting over",
    count: "8.4k expressions",
    description: "New cities, new work, new selves — and the fear in between.",
    className: "bg-orange",
  },
  {
    title: "Quiet victories",
    count: "5.1k expressions",
    description: "Small wins people are not ready to announce yet.",
    className: "bg-teal text-white",
  },
];

export function ExploreView() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      topics.filter((topic) =>
        `${topic.title} ${topic.description}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-6 sm:px-8 md:py-10 xl:px-14">
      <PageHeader
        eyebrow="Explore"
        title="Find what people can't say elsewhere"
        description="Browse moods, anonymous communities, and open letters."
      />

      <div className="relative mt-7 max-w-3xl">
        <Search className="absolute left-4 top-[42px] size-4 text-muted" />
        <Input
          label="Search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try #starting-over or feeling hopeful"
          className="pl-11"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {filtered.map((topic) => (
          <Card
            key={topic.title}
            className={`min-h-[260px] border-0 p-6 ${topic.className}`}
          >
            <h2 className="text-2xl font-bold tracking-[-0.5px]">{topic.title}</h2>
            <p className="mt-3 text-sm font-semibold">{topic.count}</p>
            <p className="mt-8 max-w-xs text-sm leading-6 opacity-85">
              {topic.description}
            </p>
          </Card>
        ))}
      </div>

      <section id="open-letters" className="mt-10">
        <h2 className="text-2xl font-bold tracking-[-0.5px]">
          Open letters trending now
        </h2>
        <Card className="mt-4 border-0 bg-lavender p-7 text-white sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.08em]">
            To the friend I stopped calling
          </p>
          <blockquote className="mt-6 max-w-4xl text-2xl font-bold leading-9 tracking-[-0.5px] sm:text-3xl">
            “I hope you know the silence was never because I stopped caring.”
          </blockquote>
        </Card>
      </section>
    </div>
  );
}

"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FeedView } from "@/features/feed/components/feed-view";
import { toast } from "@/components/ui";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get("auth");

  useEffect(() => {
    if (!authError) return;

    console.error("Auth redirect failed", { authError });
    toast.error(
      "Google login could not start",
      "Please try again in a moment. If it keeps happening, contact support.",
    );
    router.replace("/");
  }, [authError, router]);

  return <FeedView />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<FeedView />}>
      <HomeContent />
    </Suspense>
  );
}

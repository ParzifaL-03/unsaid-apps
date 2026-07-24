import type { Metadata } from "next";
import { ExploreView } from "@/features/explore/components/explore-view";

export const metadata: Metadata = {
  title: "Explore",
};

export default function ExplorePage() {
  return <ExploreView />;
}

import type { Metadata } from "next";
import { OpenLettersView } from "@/features/open-letters/components/open-letters-view";

export const metadata: Metadata = {
  title: "Open Letters",
};

export default function OpenLettersPage() {
  return <OpenLettersView />;
}

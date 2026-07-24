import type { Metadata } from "next";
import { Composer } from "@/features/compose/components/composer";

export const metadata: Metadata = {
  title: "New expression",
};

export default function ComposePage() {
  return <Composer />;
}

import type { Metadata } from "next";
import { SafetyView } from "@/features/safety/components/safety-view";

export const metadata: Metadata = {
  title: "Safety & profile",
};

export default function SafetyPage() {
  return <SafetyView />;
}

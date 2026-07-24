import type { Metadata } from "next";
import { CapsulesView } from "@/features/capsules/components/capsules-view";

export const metadata: Metadata = {
  title: "Capsules",
};

export default function CapsulesPage() {
  return <CapsulesView />;
}

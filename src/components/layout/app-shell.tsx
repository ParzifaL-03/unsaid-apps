import type { ReactNode } from "react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas md:grid md:grid-cols-[92px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
      <Sidebar />
      <div className="min-w-0">
        <MobileHeader />
        <main className="min-h-[calc(100vh-4rem)] pb-20 md:min-h-screen md:pb-0">
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}

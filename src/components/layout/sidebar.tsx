"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Sparkles } from "lucide-react";
import { useState } from "react";
import { Avatar, Button, buttonVariants } from "@/components/ui";
import { navigation } from "@/components/layout/navigation";
import { AuthDialog } from "@/features/auth/components/auth-dialog";
import { useAuth } from "@/features/auth/auth-context";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  const path = href.split("#")[0];
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

export function Sidebar() {
  const pathname = usePathname();
  const { account, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen flex-col overflow-y-auto bg-surface px-4 py-7 md:flex xl:px-6 xl:py-8">
        <Link href="/" className="mb-6 flex items-center gap-2 px-2">
          <span className="text-2xl font-bold tracking-[-0.5px]">UNSAID</span>
          <Sparkles className="size-4 text-coral" aria-hidden="true" />
        </Link>

        <nav aria-label="Primary navigation" className="grid gap-2">
          {navigation.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-colors xl:px-4",
                  active
                    ? "bg-inverse text-white"
                    : "text-ink hover:bg-canvas/70",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/compose"
          className={cn(buttonVariants({ size: "md" }), "mt-5 xl:w-full")}
        >
          <span className="md:hidden xl:inline">Write something</span>
          <span className="hidden md:inline xl:hidden">Write</span>
        </Link>

        <div className="mt-auto pt-8">
          {account ? (
            <div className="rounded-[20px] bg-canvas p-3 xl:p-4">
              <div className="flex items-center gap-3">
                <Avatar alias={account.alias} />
                <div className="hidden min-w-0 xl:block">
                  <p className="truncate text-sm font-semibold">
                    {account.alias}
                  </p>
                  <p className="text-xs text-muted">
                    {account.provider === "google"
                      ? "Gmail account"
                      : "Anonymous account"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                className="mt-3 hidden xl:flex"
                onClick={signOut}
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              fullWidth
              className="hidden xl:inline-flex"
              onClick={() => setAuthOpen(true)}
            >
              Create account
            </Button>
          )}
        </div>
      </aside>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}

"use client";

import { useState } from "react";
import { Avatar, Button } from "@/components/ui";
import { AuthDialog } from "@/features/auth/components/auth-dialog";
import { useAuth } from "@/features/auth/auth-context";

export function MobileHeader() {
  const { account } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-surface px-5 md:hidden">
        <span className="text-2xl font-bold tracking-[-0.5px]">UNSAID</span>
        {account ? (
          <Avatar alias={account.alias} size="sm" />
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setAuthOpen(true)}
          >
            Join
          </Button>
        )}
      </header>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}

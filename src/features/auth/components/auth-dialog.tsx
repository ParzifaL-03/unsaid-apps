"use client";

import { Mail } from "lucide-react";
import { Alert, Dialog, buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";

export type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create your anonymous account"
      description="Google verifies the private account behind your activity. Other people only see your rotating alias."
    >
      <div className="grid gap-5">
        <Alert
          title="Anonymous to people, accountable to the platform"
          description="Your email is never included in public posts, replies, letters, or capsules."
          variant="info"
        />
        <a
          href="/api/auth/google"
          className={cn(
            buttonVariants({ variant: "primary", fullWidth: true }),
          )}
        >
          <Mail className="size-4" aria-hidden="true" />
          Continue with Gmail
        </a>
      </div>
    </Dialog>
  );
}

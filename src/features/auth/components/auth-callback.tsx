"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Alert, Card, buttonVariants } from "@/components/ui";
import { useAuth } from "@/features/auth/auth-context";
import { cn } from "@/lib/utils";

const errorMessages: Record<string, string> = {
  "missing-google-config": "Google login is not configured on the server yet.",
  "invalid-google-state":
    "The login request expired or could not be verified. Please try again.",
  "google-token-failed":
    "Google could not exchange the authorization code. Please try again.",
  "google-token-missing":
    "Google did not return a valid access token. Please try again.",
  "google-user-failed":
    "Your Google profile could not be loaded. Please try again.",
  "google-email-unverified":
    "Use a Google account with a verified email address.",
};

export function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { account, isHydrated } = useAuth();
  const errorCode = searchParams.get("error");

  useEffect(() => {
    if (!errorCode && isHydrated && account) {
      router.replace("/");
    }
  }, [account, errorCode, isHydrated, router]);

  if (errorCode) {
    return (
      <Card className="mx-auto mt-12 max-w-xl p-6 sm:p-8">
        <Alert
          title="Google login failed"
          description={
            errorMessages[errorCode] ??
            "The login could not be completed. Please try again."
          }
          variant="danger"
        />
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "primary", fullWidth: true }),
            "mt-5",
          )}
        >
          Back and try again
        </Link>
      </Card>
    );
  }

  if (isHydrated && !account) {
    return (
      <Card className="mx-auto mt-12 max-w-xl p-6 sm:p-8">
        <Alert
          title="Session cookie was not received"
          description="Check the backend cookie, CORS, HTTPS, and frontend URL settings, then try Google login again."
          variant="danger"
        />
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "primary", fullWidth: true }),
            "mt-5",
          )}
        >
          Back and try again
        </Link>
      </Card>
    );
  }

  return (
    <Card className="mx-auto mt-12 max-w-xl p-8 text-center">
      <p className="text-lg font-bold">Finishing Google login…</p>
      <p className="mt-2 text-sm text-muted">
        Verifying your private session before returning to UNSAID.
      </p>
    </Card>
  );
}

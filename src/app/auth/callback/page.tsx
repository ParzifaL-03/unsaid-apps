import { Suspense } from "react";
import { AuthCallback } from "@/features/auth/components/auth-callback";

export default function AuthCallbackPage() {
  return (
    <main className="min-h-[60vh] px-5 py-8">
      <Suspense fallback={null}>
        <AuthCallback />
      </Suspense>
    </main>
  );
}

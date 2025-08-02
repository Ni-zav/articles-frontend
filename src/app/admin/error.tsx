"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminRootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const { show } = useToast();

  useEffect(() => {
    const msg = error?.message ? `Failed to load admin area: ${error.message}` : "Failed to load admin area";
    show(msg, { type: "error" });
  }, [error, show]);

  return (
    <section className="p-4 space-y-4" role="alert" aria-live="assertive">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm muted">
        The admin area encountered an error. You can try again or return to the dashboard.
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            reset();
            router.refresh();
          }}
          className="button button-primary button-sm"
          aria-label="Retry loading admin area"
        >
          Retry
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="button button-outline button-sm"
          aria-label="Back to admin dashboard"
        >
          Back to Admin
        </button>
      </div>
    </section>
  );
}
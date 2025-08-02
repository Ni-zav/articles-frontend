"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminCategoriesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const { show } = useToast();

  useEffect(() => {
    const msg = error?.message ? `Failed to load categories: ${error.message}` : "Failed to load categories";
    show(msg, { type: "error" });
  }, [error, show]);

  return (
    <section className="p-4 space-y-4" role="alert" aria-live="assertive">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-gray-700">
        The categories page encountered an error. You can try again or go back to the admin dashboard.
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            reset();
            router.refresh();
          }}
          className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
          aria-label="Retry loading categories"
        >
          Retry
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="px-3 py-2 rounded-md border text-sm focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
          aria-label="Back to admin"
        >
          Back to Admin
        </button>
      </div>
    </section>
  );
}
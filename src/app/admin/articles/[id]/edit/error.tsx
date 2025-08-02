"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminArticleEditError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const { show } = useToast();

  useEffect(() => {
    const msg = error?.message
      ? `Failed to load editor: ${error.message}`
      : "An error occurred while loading the editor";
    show(msg, { type: "error" });
  }, [error, show]);

  return (
    <section aria-labelledby="edit-article-error-title" className="max-w-3xl space-y-4">
      <h1 id="edit-article-error-title" className="text-xl font-semibold">Something went wrong</h1>
      <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto" aria-label="Error details">
        {error?.message || "Unknown error"}
      </pre>
      <div>
        <button
          type="button"
          onClick={() => {
            reset();
            router.refresh();
          }}
          className="px-3 py-2 rounded-md border text-sm focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
          aria-label="Retry loading editor"
        >
          Retry
        </button>
      </div>
    </section>
  );
}
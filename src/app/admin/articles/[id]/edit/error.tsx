"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

export default function Error({ error }: { error: Error & { digest?: string } }) {
  const router = useRouter();
  const { show } = useToast();

  React.useEffect(() => {
    show("An error occurred while loading the editor", { type: "error" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section aria-labelledby="edit-article-error-title" className="max-w-3xl space-y-4">
      <h1 id="edit-article-error-title" className="text-xl font-semibold">Something went wrong</h1>
      <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto" aria-label="Error details">
        {error?.message || "Unknown error"}
      </pre>
      <div>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="px-3 py-2 rounded-md border text-sm focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
        >
          Retry
        </button>
      </div>
    </section>
  );
}
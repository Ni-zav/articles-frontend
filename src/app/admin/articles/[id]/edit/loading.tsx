import React from "react";
import { TextSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section aria-labelledby="edit-article-loading-title" className="max-w-3xl space-y-4">
      <h1 id="edit-article-loading-title" className="sr-only">Loading editor</h1>
      <div className="space-y-3">
        <TextSkeleton lines={1} />
        <TextSkeleton lines={1} />
        <TextSkeleton lines={6} />
      </div>
    </section>
  );
}
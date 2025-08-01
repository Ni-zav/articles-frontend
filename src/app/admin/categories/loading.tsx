import React from "react";
import { TextSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section aria-labelledby="categories-loading-title" className="space-y-4">
      <h1 id="categories-loading-title" className="sr-only">Loading Categories</h1>
      <div className="space-y-2">
        <TextSkeleton lines={1} />
        <TextSkeleton lines={1} />
        <TextSkeleton lines={1} />
      </div>
    </section>
  );
}
"use client";

import React from "react";

type LoadingProps = {
  message?: string;
  compact?: boolean;
  className?: string;
};

export default function Loading({ message = "Loading…", compact, className }: LoadingProps) {
  const sectionClass = ["p-4", className].filter(Boolean).join(" ");
  const bar = <div className="skeleton rounded" />;

  if (compact) {
    return (
      <section className={sectionClass} role="status" aria-live="polite" aria-busy="true">
        <p className="text-sm muted">{message}</p>
      </section>
    );
  }

  return (
    <section className={sectionClass} role="status" aria-live="polite" aria-busy="true">
      <div className="h-6 w-40 skeleton rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        <div className="space-y-2">
          <div className="h-4 w-24 skeleton rounded" />
          <div className="h-9 w-full skeleton rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 skeleton rounded" />
          <div className="h-9 w-full skeleton rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 skeleton rounded" />
          <div className="h-9 w-full skeleton rounded" />
        </div>
      </div>
      <div className="space-y-2 mt-3">
        <div className="h-10 w-full skeleton rounded" />
        <div className="h-10 w-full skeleton rounded" />
        <div className="h-10 w-full skeleton rounded" />
      </div>
    </section>
  );
}
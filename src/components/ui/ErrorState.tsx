"use client";

import React from "react";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  backHref?: string;
  className?: string;
  compact?: boolean;
};

export default function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  backHref = "/",
  className,
  compact,
}: ErrorStateProps) {
  const sectionClass = ["max-w-xl mx-auto p-4", className].filter(Boolean).join(" ");
  const cardClass = ["ui-card space-y-3"].join(" ");

  if (compact) {
    return (
      <section className={sectionClass} aria-live="polite" role="status">
        <p className="alert-error text-sm">{title}</p>
      </section>
    );
  }

  return (
    <section className={sectionClass} aria-live="polite" role="status">
      <div className={cardClass}>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm muted">{message}</p>
        <div className="flex items-center gap-2 pt-1">
          {onRetry ? (
            <button type="button" onClick={onRetry} className="button button-primary button-sm" aria-label="Retry action">
              Retry
            </button>
          ) : null}
          <a href={backHref} className="button button-outline button-sm" aria-label="Go back">
            Go Back
          </a>
        </div>
      </div>
    </section>
  );
}
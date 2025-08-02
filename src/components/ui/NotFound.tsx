"use client";

import React from "react";

type NotFoundProps = {
  title?: string;
  message?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
  compact?: boolean;
};

export default function NotFound({
  title = "Not Found",
  message = "The page you’re looking for doesn’t exist or may have been moved.",
  primaryHref = "/",
  primaryLabel = "Go Home",
  secondaryHref,
  secondaryLabel,
  className,
  compact,
}: NotFoundProps) {
  const sectionClass = ["max-w-xl mx-auto p-4", className].filter(Boolean).join(" ");
  const cardClass = ["ui-card space-y-3"].join(" ");

  if (compact) {
    return (
      <section className={sectionClass} aria-live="polite" role="status">
        <p className="text-sm muted">{title}</p>
      </section>
    );
  }

  return (
    <section className={sectionClass} aria-live="polite" role="status">
      <div className={cardClass}>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm muted">{message}</p>
        <div className="flex items-center gap-2 pt-1">
          <a href={primaryHref} className="button button-primary button-sm" aria-label={primaryLabel}>
            {primaryLabel}
          </a>
          {secondaryHref && secondaryLabel ? (
            <a href={secondaryHref} className="button button-outline button-sm" aria-label={secondaryLabel}>
              {secondaryLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
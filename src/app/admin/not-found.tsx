"use client";

import React from "react";
import Link from "next/link";

export default function AdminNotFound() {
  return (
    <section className="max-w-xl mx-auto p-4">
      <div className="ui-card space-y-3">
        <h1 className="text-lg font-semibold">Not Found</h1>
        <p className="text-sm muted">
          The admin page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <Link href="/admin" className="button button-primary button-sm" aria-label="Go to Admin Dashboard">
            Go to Admin Dashboard
          </Link>
          <Link href="/" className="button button-outline button-sm" aria-label="Go Home">
            Go Home
          </Link>
        </div>
      </div>
    </section>
  );
}
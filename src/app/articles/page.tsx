import React, { Suspense } from "react";
import ArticlesClient from "./ArticlesClient";

export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-bold">Articles</h1>
            <p className="text-sm muted">Loading…</p>
          </header>
          <section role="status" aria-live="polite" aria-busy="true" className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 rounded-lg skeleton" />
              ))}
            </div>
          </section>
        </div>
      }
    >
      <ArticlesClient />
    </Suspense>
  );
}

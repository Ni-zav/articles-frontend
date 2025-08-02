"use client";

import React, { useState } from "react";
import { categoriesService } from "@/services/categories";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter } from "next/navigation";

export default function AdminCategoryCreatePage() {
  const router = useRouter();
  const { show } = useToast();
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const nameError =
    touched && (!name.trim() ? "Name is required" : name.trim().length < 2 ? "Name must be at least 2 characters" : "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (nameError) return;
    setSubmitting(true);
    try {
      await categoriesService.create({ name: name.trim() });
      show("Category created", { type: "success" });
      // Keep submitting true until navigation; avoid back to form
      router.replace("/admin/categories");
      return;
    } catch {
      show("Failed to create category", { type: "error" });
    } finally {
      // Only clear when staying due to error
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="create-category-title" className="max-w-lg">
      <h1 id="create-category-title" className="text-xl font-semibold mb-4">New Category</h1>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={!!nameError}
            aria-describedby={nameError ? "name-error" : undefined}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-2 focus:outline-offset-2 focus:outline-orange-600"
            placeholder="e.g. Technology"
            required
          />
          {nameError ? (
            <p id="name-error" role="alert" className="mt-1 text-sm text-red-600">{nameError}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-3 py-2 rounded-md bg-orange-600 text-white text-sm focus:outline-2 focus:outline-offset-2 focus:outline-orange-600 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Create"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!submitting) router.push("/admin/categories");
            }}
            className="px-3 py-2 rounded-md border text-sm focus:outline-2 focus:outline-offset-2 focus:outline-orange-600 disabled:opacity-50"
            disabled={submitting}
            aria-disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
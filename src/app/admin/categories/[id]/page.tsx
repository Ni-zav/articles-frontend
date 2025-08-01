"use client";

import React, { useEffect, useState } from "react";
import { categoriesService } from "@/services/categories";
import { useToast } from "@/components/ui/ToastProvider";
import { useParams, useRouter } from "next/navigation";

export default function AdminCategoryEditPage() {
  const router = useRouter();
  const params = useParams();
  const { show } = useToast();

  const id = String(params?.id ?? "");
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const nameError =
    touched && (!name.trim() ? "Name is required" : name.trim().length < 2 ? "Name must be at least 2 characters" : "");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        // No get endpoint in service; list and find by id as fallback
        const res = await categoriesService.list({ page: 1, limit: 1000 });
        if (!active) return;
        const found = (res.data || []).find((c) => c.id === id);
        if (found) setName(found.name);
      } catch {
        show("Failed to load category", { type: "error" });
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id, show]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (nameError) return;
    setSubmitting(true);
    try {
      await categoriesService.update(id, { name: name.trim() });
      show("Category updated", { type: "success" });
      router.push("/admin/categories");
    } catch {
      show("Failed to update category", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="edit-category-title" className="max-w-lg">
      <h1 id="edit-category-title" className="text-xl font-semibold mb-4">Edit Category</h1>

      {loading ? (
        <p className="text-sm text-gray-600">Loading…</p>
      ) : (
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
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
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
              className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm focus:outline-2 focus:outline-offset-2 focus:outline-blue-600 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/categories")}
              className="px-3 py-2 rounded-md border text-sm focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
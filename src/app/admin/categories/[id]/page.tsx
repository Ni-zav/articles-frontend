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
      // debug log for QA verification
      // eslint-disable-next-line no-console
      console.log("[Category Edit] Update success:", { id, name: name.trim() });
      router.push("/admin/categories");
    } catch (err: any) {
      show(err?.response?.data?.message ?? "Failed to update category", { type: "error" });
      // eslint-disable-next-line no-console
      console.error("[Category Edit] Update failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="edit-category-title" className="max-w-lg">
      <h1 id="edit-category-title" className="text-xl font-semibold mb-4">Edit Category</h1>

      {loading ? (
        <p className="text-sm muted">Loading…</p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4" aria-describedby={nameError ? "name-error" : undefined}>
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
              className="input text-sm"
              placeholder="e.g. Technology"
              minLength={2}
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
              className="button button-primary text-sm disabled:opacity-50"
              aria-label="Save category"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                // eslint-disable-next-line no-console
                console.log("[Category Edit] Cancel pressed");
                router.push("/admin/categories");
              }}
              className="button button-outline text-sm"
              aria-label="Cancel and go back"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
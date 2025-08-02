"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { articlesService } from "@/services/articles";
import { categoriesService } from "@/services/categories";
import type { Article, Category } from "@/types";
import TipTapEditor from "@/components/editor/Editor";
import { useToast } from "@/components/ui/ToastProvider";
import { http } from "@/lib/http";

export default function AdminArticleEditPage() {
  const router = useRouter();
  const params = useParams();
  const { show } = useToast();

  const id = String(params?.id ?? "");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState<string>("");
  const [isDraft, setIsDraft] = useState<boolean>(false);

  const titleError = useMemo(() => (!title.trim() ? "Title is required" : ""), [title]);
  const categoryError = useMemo(() => (!categoryId ? "Category is required" : ""), [categoryId]);
  const contentError = useMemo(() => {
    const clean = content.replace(/<p>\s*<\/p>/g, "").trim();
    return !clean ? "Content cannot be empty" : "";
  }, [content]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [a, cats] = await Promise.all([
          articlesService.getById(id),
          categoriesService.list({ limit: 1000, page: 1 }),
        ]);
        if (!active) return;
        setArticle(a);
        setTitle(a.title || "");
        setCategoryId(a.categoryId || "");
        setContent(a.content || "<p></p>");
        setCategories(cats.data || []);
      } catch {
        show("Failed to load article or categories", { type: "error" });
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id, show]);

  async function handleUpload(file: File): Promise<string | undefined> {
    // Admin-only upload per API; non-admins will get 403 from server if attempted elsewhere.
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await http.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = (res.data as any)?.imageUrl as string | undefined;
      if (!url) throw new Error("No imageUrl in response");
      show("Image uploaded", { type: "success" });
      return url;
    } catch {
      show("Image upload failed; using local preview instead", { type: "warning" });
      return undefined;
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (titleError || categoryError || contentError) {
      show("Please fix validation errors", { type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      await articlesService.update(id, {
        title: title.trim(),
        content,
        categoryId,
      });
      show(isDraft ? "Draft saved" : "Article updated", { type: "success" });
      // Keep submitting state active until navigation completes; avoid back to edit with replace
      router.replace("/admin/articles");
      return;
    } catch {
      show("Failed to save article", { type: "error" });
    } finally {
      // Only clear when staying on page due to error
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="p-4" role="status" aria-live="polite" aria-busy="true">
        <p className="text-sm muted">Loading editor…</p>
      </section>
    );
  }

  if (!article) {
    return (
      <section className="p-4">
        <p role="alert" className="alert-error text-sm">Article not found</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="edit-article-title" className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 id="edit-article-title" className="text-xl font-semibold">Edit Article</h1>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isDraft}
              onChange={(e) => setIsDraft(e.target.checked)}
              className="h-4 w-4"
              aria-label="Draft mode"
            />
            Draft
          </label>
        </div>
      </div>

      <form onSubmit={onSave} noValidate className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={!!titleError}
            aria-describedby={titleError ? "title-error" : undefined}
            className="input text-sm"
            placeholder="Enter article title"
            required
          />
          {titleError ? <p id="title-error" role="alert" className="mt-1 text-sm text-red-600">{titleError}</p> : null}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            aria-invalid={!!categoryError}
            aria-describedby={categoryError ? "category-error" : undefined}
            className="select text-sm"
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {categoryError ? <p id="category-error" role="alert" className="mt-1 text-sm text-red-600">{categoryError}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <TipTapEditor
            initialHTML={content}
            onChange={setContent}
            onRequestImageUpload={handleUpload}
            ariaLabel="Article content editor"
          />
          {contentError ? <p role="alert" className="mt-1 text-sm text-red-600">{contentError}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="button button-primary text-sm disabled:opacity-50"
            aria-label="Save article"
          >
            {submitting ? "Saving…" : isDraft ? "Save Draft" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!submitting) router.push("/admin/articles");
            }}
            className="button button-outline text-sm disabled:opacity-50"
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
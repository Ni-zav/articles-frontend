"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TipTapEditor from "@/components/editor/Editor";
import { categoriesService } from "@/services/categories";
import { articlesService } from "@/services/articles";
import type { Category } from "@/types";
import { useToast } from "@/components/ui/ToastProvider";

function stripHtml(html: string) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || "";
  return text.replace(/\u00A0/g, " ").trim();
}

export default function CreateArticlePage() {
  const router = useRouter();
  const { show } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [catsError, setCatsError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ title?: boolean; category?: boolean; content?: boolean }>({});

  useEffect(() => {
    let active = true;
    async function loadCats() {
      setCatsLoading(true);
      setCatsError(null);
      try {
        const res = await categoriesService.list({ limit: 1000, page: 1, search: "" });
        if (!active) return;
        setCategories(res.data || []);
      } catch {
        if (!active) return;
        setCatsError("Failed to load categories");
      } finally {
        if (active) setCatsLoading(false);
      }
    }
    loadCats();
    return () => {
      active = false;
    };
  }, []);

  const titleError = useMemo(() => (!title.trim() ? "Title is required" : ""), [title]);
  const categoryError = useMemo(() => (!categoryId ? "Category is required" : ""), [categoryId]);
  const contentError = useMemo(() => {
    const plain = stripHtml(content.replace(/<p>\s*<\/p>/g, ""));
    return !plain ? "Content cannot be empty" : "";
  }, [content]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ title: true, category: true, content: true });
    if (titleError || categoryError || contentError) {
      show("Please fix validation errors", { type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const created = await articlesService.create({
        title: title.trim(),
        content,
        categoryId,
      });
      show("Article created", { type: "success" });
      // Redirect preference: list by default; if id available, go to detail
      router.push(created?.id ? `/articles/${created.id}` : "/articles");
    } catch {
      show("Failed to create article", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  const formErrorSummary =
    (touched.title && titleError) || (touched.category && categoryError) || (touched.content && contentError);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <nav className="text-sm text-gray-600" aria-label="Breadcrumb">
        <ol className="list-reset flex items-center gap-1">
          <li>
            <Link className="hover:underline" href="/">Home</Link>
          </li>
          <li>/</li>
          <li>
            <Link className="hover:underline" href="/articles">Articles</Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">Create</li>
        </ol>
      </nav>

      <h1 className="text-2xl font-bold">Create Article</h1>

      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-4"
        aria-describedby={formErrorSummary ? "form-errors" : undefined}
      >
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, title: true }))}
            aria-invalid={!!(touched.title && titleError)}
            aria-describedby={touched.title && titleError ? "title-error" : undefined}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-2 focus:outline-offset-2 focus:outline-orange-600"
            placeholder="Enter article title"
            required
          />
          {touched.title && titleError ? <p id="title-error" role="alert" className="mt-1 text-sm text-red-600">{titleError}</p> : null}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, category: true }))}
            aria-invalid={!!(touched.category && categoryError)}
            aria-describedby={touched.category && categoryError ? "category-error" : undefined}
            className="select text-sm"
            required
            disabled={catsLoading || !!catsError}
          >
            <option value="">{catsLoading ? "Loading..." : "Select category"}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {touched.category && categoryError ? <p id="category-error" role="alert" className="mt-1 text-sm text-red-600">{categoryError}</p> : null}
          {catsError ? <p role="alert" className="mt-1 text-sm text-red-600">{catsError}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <TipTapEditor
            initialHTML={content}
            onChange={setContent}
            onRequestImageUpload={undefined}
            ariaLabel="Article content editor"
          />
          {touched.content && contentError ? <p id="content-error" role="alert" className="mt-1 text-sm text-red-600">{contentError}</p> : null}
        </div>

        {formErrorSummary ? (
          <div id="form-errors" role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            Please correct the highlighted errors before submitting.
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="button button-primary text-sm disabled:opacity-50"
            aria-label="Create article"
          >
            {submitting ? "Creating…" : "Create"}
          </button>
          <Link
            href="/articles"
            className="button button-outline text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
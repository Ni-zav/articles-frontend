"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { articlesService } from "@/services/articles";
import { categoriesService } from "@/services/categories";
import type { Article, Category, PaginatedResponse } from "@/types";

export default function AdminArticlesListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState<string>(searchParams?.get("title") ?? "");
  const [categoryId, setCategoryId] = useState<string>(searchParams?.get("category") ?? "");
  const [page, setPage] = useState<number>(Number(searchParams?.get("page") ?? 1));
  const [loading, setLoading] = useState<boolean>(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<PaginatedResponse<Article> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (title) params.set("title", title);
    if (categoryId) params.set("category", categoryId);
    params.set("page", String(page));
    const qs = params.toString();
    router.replace(`/admin/articles${qs ? `?${qs}` : ""}`);
  }, [title, categoryId, page, router]);

  useEffect(() => {
    let active = true;
    categoriesService
      .list({ limit: 1000, page: 1 })
      .then((res) => {
        if (!active) return;
        setCategories(res.data ?? []);
      })
      .catch(() => {
        // ignore error; UI stays usable
      });
    return () => {
      active = false;
    };
  }, []);

  const [debouncedTitle, setDebouncedTitle] = useState(title);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTitle(title), 300);
    return () => clearTimeout(t);
  }, [title]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    articlesService
      .list({
        title: debouncedTitle || undefined,
        category: categoryId || undefined,
        page,
      })
      .then((res) => {
        if (!active) return;
        setData(res);
      })
      .catch(() => {
        if (!active) return;
        setData({
          data: [],
          page,
          limit: 10,
          total: 0,
          totalData: 0,
          currentPage: page,
          totalPages: 1,
        } as any);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedTitle, categoryId, page]);

  const totalPages = useMemo(() => data?.totalPages ?? 1, [data]);

  return (
    <section className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Articles</h1>
        <Link
          href="/articles/create"
          className="button button-primary text-sm"
        >
          + Create
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="f-title" className="block text-sm font-medium mb-1">Title</label>
          <input
            id="f-title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setPage(1); }}
            placeholder="Search by title"
            className="input text-sm"
          />
        </div>
        <div>
          <label htmlFor="f-category" className="block text-sm font-medium mb-1">Category</label>
          <select
            id="f-category"
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            className="select text-sm"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm table">
          <thead>
            <tr>
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2 w-48">Category</th>
              <th className="text-left p-2 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-2 text-gray-600" colSpan={3}>Loading…</td></tr>
            ) : (data?.data?.length ?? 0) === 0 ? (
              <tr><td className="p-2 text-gray-600" colSpan={3}>No articles found.</td></tr>
            ) : (
              data!.data!.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-2">
                    <div className="font-medium">{a.title}</div>
                    <div className="text-xs text-gray-500 truncate">{a.id}</div>
                  </td>
                  <td className="p-2">{a.category?.name ?? "Uncategorized"}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/articles/${a.id}/edit`}
                        className="button button-outline text-sm px-2 py-1"
                        aria-label={`Edit ${a.title}`}
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/articles/${a.id}`}
                        className="button button-outline text-sm px-2 py-1"
                        aria-label={`View ${a.title}`}
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-2 rounded-md border text-sm disabled:opacity-50"
          aria-label="Previous page"
        >
          Prev
        </button>
        <div className="text-sm">Page {page} of {totalPages}</div>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-2 rounded-md border text-sm disabled:opacity-50"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </section>
  );
}
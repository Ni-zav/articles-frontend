"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { categoriesService, type ListCategoriesParams } from "@/services/categories";
import type { Category } from "@/types";
import { TextSkeleton } from "@/components/ui/Skeleton";

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function AdminCategoriesListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [page, setPage] = useState<number>(() => Number(searchParams.get("page") || 1));
  const [limit] = useState<number>(10);
  const [search, setSearch] = useState<string>(() => searchParams.get("search") || "");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [error, setError] = useState<string | null>(null);

  const qp = useMemo(() => {
    const params = new URLSearchParams();
    if (page && page !== 1) params.set("page", String(page));
    if (debouncedSearch) params.set("search", debouncedSearch);
    return params.toString();
  }, [page, debouncedSearch]);

  useEffect(() => {
    const url = qp ? `/admin/categories?${qp}` : "/admin/categories";
    router.replace(url);
  }, [qp, router]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params: ListCategoriesParams = {
          page,
          limit,
          search: debouncedSearch || undefined,
        };
        const data = await categoriesService.list(params);
        if (!active) return;
        setItems(data.data || []);
        setTotal(data.total ?? data.totalData);
      } catch (e) {
        if (!active) return;
        setError("Failed to load categories");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [page, limit, debouncedSearch]);

  async function onDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    try {
      await categoriesService.remove(id);
      // refresh current page
      const data = await categoriesService.list({ page, limit, search: debouncedSearch || undefined });
      setItems(data.data || []);
      setTotal(data.total ?? data.totalData);
    } catch {
      alert("Delete failed");
    }
  }

  return (
    <section aria-labelledby="categories-title" className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 id="categories-title" className="text-xl font-semibold">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="button button-primary text-sm"
        >
          New Category
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="search" className="sr-only">Search</label>
        <input
          id="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories…"
          className="input text-sm max-w-xs"
          aria-label="Search categories"
        />
      </div>

      {error ? (
        <div role="alert" className="text-sm text-red-600">{error}</div>
      ) : loading ? (
        <div className="space-y-2">
          <TextSkeleton lines={1} />
          <TextSkeleton lines={1} />
          <TextSkeleton lines={1} />
        </div>
      ) : (
        <div className="overflow-auto rounded border">
          <table className="min-w-full text-sm table">
            <thead className="">
              <tr>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Created</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-gray-500">No categories found</td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-3 py-2">{c.name}</td>
                    <td className="px-3 py-2">{new Date(c.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/categories/${c.id}`}
                          className="button button-outline text-sm px-2 py-1"
                          aria-label={`Edit ${c.name}`}
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(c.id)}
                          className="button text-sm px-2 py-1 border border-red-500/50 text-red-400 hover:bg-[color-mix(in_oklab,var(--danger)_8%,var(--bg))]"
                          aria-label={`Delete ${c.name}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* pagination basic */}
      {total && total > limit ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-2 py-1 rounded border disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">Page {page}</span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="px-2 py-1 rounded border"
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}
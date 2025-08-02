"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Article, PaginatedResponse, User } from "@/types";
import { articlesService } from "@/services/articles";

type DerivedUser = User & { postCount?: number };

function extractUniqueUsers(p: PaginatedResponse<Article> | null | undefined): DerivedUser[] {
  const map = new Map<string, DerivedUser>();
  const items = p?.data ?? [];
  for (const a of items) {
    if (a.user && a.user.id) {
      if (!map.has(a.user.id)) {
        map.set(a.user.id, {
          id: a.user.id,
          username: a.user.username,
          role: a.user.role,
          postCount: undefined,
        });
      }
    }
  }
  return Array.from(map.values());
}

async function fetchUserPostCount(userId: string): Promise<number | undefined> {
  try {
    const res = await articlesService.list({ userId, page: 1, limit: 1 });
    const total =
      typeof res.totalData === "number"
        ? res.totalData
        : typeof res.total === "number"
        ? res.total
        : Array.isArray(res.data)
        ? res.data.length
        : undefined;
    return typeof total === "number" ? total : undefined;
  } catch {
    return undefined;
  }
}

export default function AdminUsersListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState<number>(() => Number(searchParams?.get("page") ?? 1));
  const [title, setTitle] = useState<string>(searchParams?.get("title") ?? "");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaginatedResponse<Article> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (title) qs.set("title", title);
    if (page && page !== 1) qs.set("page", String(page));
    const q = qs.toString();
    router.replace(`/admin/users${q ? `?${q}` : ""}`);
  }, [router, title, page]);

  const [debouncedTitle, setDebouncedTitle] = useState(title);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTitle(title), 300);
    return () => clearTimeout(t);
  }, [title]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    articlesService
      .list({
        title: debouncedTitle || undefined,
        page,
      })
      .then((res) => {
        if (!active) return;
        setData(res);
      })
      .catch(() => {
        if (!active) return;
        setError("Failed to load users");
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
  }, [debouncedTitle, page]);

  const users = useMemo(() => extractUniqueUsers(data), [data]);
  const totalPages = useMemo(() => data?.totalPages ?? 1, [data]);

  const [counts, setCounts] = useState<Record<string, number | undefined>>({});

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const ids = users.map((u) => u.id).filter(Boolean);
      if (ids.length === 0) return;

      const missing = ids.filter((id) => !(id in counts));
      if (missing.length === 0) return;

      const results = await Promise.all(
        missing.map(async (id) => {
          const c = await fetchUserPostCount(id);
          return { id, c };
        })
      );

      if (cancelled) return;
      setCounts((prev) => {
        const next = { ...prev };
        for (const { id, c } of results) next[id] = c;
        return next;
      });
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [users, counts]);

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor="f-title" className="block text-sm font-medium mb-1">
            Filter by article title (derivation)
          </label>
          <input
            id="f-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setPage(1);
            }}
            placeholder="Type to filter users via article title…"
            className="input text-sm"
          />
        </div>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm table">
          <thead>
            <tr>
              <th className="text-left p-2 w-[32%]">Username</th>
              <th className="text-left p-2 w-[20%]">Role</th>
              <th className="text-left p-2 w-[20%]">Posts</th>
              <th className="text-left p-2">User ID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-2 text-gray-600" colSpan={4}>
                  Loading…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="p-2 text-red-600" colSpan={4}>
                  {error}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="p-2 text-gray-600" colSpan={4}>
                  No users found from current articles page.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">
                    {String(u.role || "User").toLowerCase() === "admin" ? "Admin" : "User"}
                  </td>
                    <td className="p-2">
                      {counts[u.id] === undefined ? (
                        <span className="text-[var(--fg-muted)]">—</span>
                      ) : (
                        counts[u.id]
                      )}
                    </td>
                  <td className="p-2">
                    <code className="text-xs text-[var(--fg-muted)]">{u.id}</code>
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
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-2 rounded-md border text-sm disabled:opacity-50"
          aria-label="Previous page"
        >
          Prev
        </button>
        <div className="text-sm">
          Page {page} of {totalPages}
        </div>
        <button
          type="button"
          disabled={page >= totalPages || loading}
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
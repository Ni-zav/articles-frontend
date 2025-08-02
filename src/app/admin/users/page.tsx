"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { http } from "@/lib/http";
import type { Article } from "@/types";

type UserAgg = { username: string; count: number };

export default function AdminUsersByPostsPage() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    http
      .get<{ data: Article[]; total?: number; page?: number; limit?: number }>("/articles", {
        params: { limit: 1000, page: 1 },
      })
      .then((res) => {
        if (!active) return;
        setArticles(res.data?.data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setError("Failed to load articles");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const usersAgg: UserAgg[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of articles) {
      const username = a.user?.username ?? "Unknown";
      map.set(username, (map.get(username) ?? 0) + 1);
    }
    let list = Array.from(map.entries()).map(([username, count]) => ({ username, count }));
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter((u) => u.username.toLowerCase().includes(s));
    }
    list.sort((a, b) => b.count - a.count || a.username.localeCompare(b.username));
    return list;
  }, [articles, search]);

  return (
    <section className="space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-semibold">Users</h1>
        <Link href="/admin" className="button button-outline text-sm self-start sm:self-auto">
          Back to Admin
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="user-search" className="block text-sm font-medium mb-1">
            Search by username
          </label>
          <input
            id="user-search"
            className="input text-sm w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type username…"
          />
        </div>
      </div>

      <div className="border rounded-md overflow-x-auto" aria-busy={loading}>
        <table className="w-full text-sm table min-w-[520px]">
          <thead>
            <tr>
              <th className="text-left p-2">Username</th>
              <th className="text-left p-2 w-32">Posts</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-2 text-gray-600" colSpan={2}>
                  Loading…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="p-2 text-red-600" colSpan={2}>
                  {error}
                </td>
              </tr>
            ) : usersAgg.length === 0 ? (
              <tr>
                <td className="p-2 text-gray-600" colSpan={2}>
                  No users found.
                </td>
              </tr>
            ) : (
              usersAgg.map((u) => (
                <tr key={u.username} className="border-t">
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">{u.count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-500">
        Data derived from articles only. Users not having any posts will not appear in this list.
      </div>
    </section>
  );
}
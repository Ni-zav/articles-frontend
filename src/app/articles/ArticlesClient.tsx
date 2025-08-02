"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { articlesService } from "@/services/articles";
import { categoriesService } from "@/services/categories";
import type { Article, Category, PaginatedResponse } from "@/types";
import { fetchWithFallback, fallbackData, paginateArray } from "@/lib/fallback";
import { PAGINATION } from "@/constants/env";
import { getToken } from "@/lib/auth";

function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// Local module-level cache for categories, used for reliable name rendering in ArticleCard
const categoriesCache: Map<string, Category> = new Map();

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.id}`}
      className="group block rounded-lg border p-4 transition outline-none focus:ring-2 focus:ring-[var(--primary)] hover:border-[var(--primary)] active:border-[var(--primary)]"
    >
      <h3 className="text-lg font-semibold">{article.title}</h3>
      <p className="text-sm text-[var(--fg-muted)] mt-1">
        {(article.category?.name ??
          (() => {
            const cat = categoriesCache.get(article.categoryId);
            return cat?.name ?? "Uncategorized";
          })())}
      </p>
      <div
        className="text-sm line-clamp-3 mt-2 prose prose-sm max-w-none text-[var(--fg-subtle)]"
        dangerouslySetInnerHTML={{ __html: article?.content ?? "" }}
        aria-label="Article preview"
      />
    </Link>
  );
}

export default function ArticlesClient() {
  const params = useSearchParams();
  const router = useRouter();
  const mine = (params?.get("mine") ?? "") === "1";

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = PAGINATION.defaultLimit;

  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number | undefined>(undefined);
  const [totalData, setTotalData] = useState<number | undefined>(undefined);

  const debouncedSearch = useDebounce(search, 400);
  const debouncedCategory = useDebounce(category, 400);

  useEffect(() => {
    let mounted = true;
    async function loadCategories() {
      const cats = await fetchWithFallback(
        async () => {
          const res = await categoriesService.list();
          return res.data;
        },
        () => fallbackData.categories
      );
      if (!mounted) return;
      setCategories(cats);
      categoriesCache.clear();
      for (const c of cats) categoriesCache.set(c.id, c);
    }
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  // Client-side safety: if trying to access /articles?mine=1 without token, redirect to login.
  useEffect(() => {
    if (mine && !getToken()) {
      try {
        router.replace(`/login?next=/articles?mine=1`);
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = `/login?next=/articles?mine=1`;
        }
      }
    }
  }, [mine, router]);

  // Client-side safety for direct navigation to /articles?mine=1 without token
  useEffect(() => {
    if (mine && !getToken()) {
      const next = encodeURIComponent("/articles?mine=1");
      try {
        router.replace(`/login?next=${next}`);
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = `/login?next=${next}`;
        }
      }
    }
  }, [mine, router]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const run = async () => {
      try {
        // Resolve current user id when mine=1 so backend can filter via userId per api-docs.md
        let meId: string | undefined = undefined;
        if (mine) {
          try {
            const { http } = await import("@/lib/http");
            const prof = await http.get("/auth/profile");
            meId = (prof.data as any)?.id as string | undefined;
          } catch {
            meId = undefined;
          }
        }

        const server = await fetchWithFallback<PaginatedResponse<Article>>(
          async () => {
            const res = await articlesService.list({
              title: debouncedSearch || undefined,
              category: debouncedCategory || undefined,
              page,
              limit,
              ...(mine && meId ? { userId: meId } : {}),
            } as any);
            return res;
          },
          () => {
            const filtered = fallbackData.articles.filter((a) => {
              const matchTitle =
                debouncedSearch.trim().length === 0 ||
                a.title.toLowerCase().includes(debouncedSearch.toLowerCase());
              const matchCat =
                debouncedCategory.trim().length === 0 ||
                a.categoryId === debouncedCategory ||
                a.category?.name?.toLowerCase() ===
                  debouncedCategory.toLowerCase();
              // When offline, approximate "mine" using userId from cached profile (if any)
              const fallbackMeId = (fallbackData as any)?.me?.id as string | undefined;
              const matchMine = !mine || (a as any).userId === (meId ?? fallbackMeId);
              return matchTitle && matchCat && matchMine;
            });
            const paged = paginateArray(filtered, page, limit);
            return {
              data: paged.data,
              page: paged.page,
              limit: paged.limit,
              total: paged.total,
              totalData: paged.totalData,
              currentPage: paged.currentPage,
              totalPages: paged.totalPages,
            };
          }
        );
        if (!mounted) return;

        const withSafeCategory = server.data.map((a) => ({
          ...a,
          category:
            a.category ??
            categories.find((c) => c.id === a.categoryId) ?? {
              id: "",
              name: "Uncategorized",
              userId: "",
              createdAt: "",
              updatedAt: "",
            },
        }));

        const sliced = withSafeCategory.slice(0, limit);
        setArticles(sliced);

        // Debug logs to verify filtering behavior (temporarily keep one; remove if noisy)
        console.log("[Articles] mine?", mine, "meId:", meId, "returned:", (server?.data ?? []).length);

        const apiTotalPages =
          server.totalPages ??
          (server.total && server.limit
            ? Math.max(1, Math.ceil(server.total / server.limit))
            : undefined);
        const apiCurrentPage = server.currentPage ?? server.page ?? page;
        const apiTotalData = server.totalData ?? server.total ?? undefined;

        setTotalPages(apiTotalPages);
        setCurrentPage(apiCurrentPage);
        setTotalData(apiTotalData);
      } catch {
        if (!mounted) return;
        setError("Failed to load articles");
      } finally {
        if (!mounted) {
          // no-unsafe-finally: avoid returning inside finally
        } else {
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [debouncedSearch, debouncedCategory, page, limit, mine, categories]);

  const categoryOptions = useMemo(() => {
    return [{ id: "", name: "All" }, ...categories.map((c) => ({ id: c.id, name: c.name }))];
  }, [categories]);

  const isLastPage = totalPages ? page >= totalPages : false;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{mine ? "My Articles" : "Articles"}</h1>
        <p className="text-sm muted">
          {mine ? "These are your articles." : `Search, filter by category, and browse articles. Pagination is ${limit} items per page.`}
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="col-span-2 input"
        />
        <select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
          className="select"
        >
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        // Shared Loading skeleton inline
        <section role="status" aria-live="polite" aria-busy="true" className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-lg skeleton" />
            ))}
          </div>
        </section>
      ) : error ? (
        <div role="alert" className="alert-error text-sm">{error}</div>
      ) : articles.length === 0 ? (
        <div className="text-sm muted">{mine ? "You have no articles yet." : "No articles found."}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              className="button button-outline button-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              Prev
            </button>
            <span className="text-sm">
              Page {currentPage ?? page}
              {totalPages ? ` / ${totalPages}` : ""}
            </span>
            <button
              className="button button-outline button-sm disabled:opacity-50"
              onClick={() => setPage((p) => p + 1)}
              disabled={isLastPage}
              aria-label="Next page"
            >
              Next
            </button>
            {typeof totalData === "number" && (
              <span className="text-xs text-[var(--fg-muted)] ml-2">
                {totalData} item{totalData === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
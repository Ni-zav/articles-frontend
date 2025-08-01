"use client";

import { useEffect, useMemo, useState } from "react";
import { articlesService } from "@/services/articles";
import { categoriesService } from "@/services/categories";
import type { Article, Category, PaginatedResponse } from "@/types";
import { fetchWithFallback, fallbackData, paginateArray } from "@/lib/fallback";
import { PAGINATION } from "@/constants/env";

function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

import Link from "next/link";

// Local module-level cache for categories, used for reliable name rendering in ArticleCard
const categoriesCache: Map<string, Category> = new Map();

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.id}`}
      className="block rounded-lg border p-4 hover:shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <h3 className="text-lg font-semibold">{article.title}</h3>
      <p className="text-sm text-gray-500 mt-1">
        {(article.category?.name ??
          (() => {
            // Fallback to category by id if relationship not populated
            const cat = categoriesCache.get(article.categoryId);
            return cat?.name ?? "Uncategorized";
          })())}
      </p>
      <div
        className="text-sm text-gray-700 line-clamp-3 mt-2 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: article?.content ?? "" }}
        aria-label="Article preview"
      />
    </Link>
  );
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = PAGINATION.defaultLimit;

  // pagination info from API
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number | undefined>(undefined);
  const [totalData, setTotalData] = useState<number | undefined>(undefined);

  const debouncedSearch = useDebounce(search, 400);
  const debouncedCategory = useDebounce(category, 400);


  // Load categories from API first; fallback to local if unavailable
  useEffect(() => {
    let mounted = true;
    async function loadCategories() {
      const cats = await fetchWithFallback(
        async () => {
          const res = await categoriesService.list();
          // API returns PaginatedResponse<Category>; prefer data from API
          return res.data;
        },
        () => fallbackData.categories
      );
      if (!mounted) return;
      setCategories(cats);
      // populate cache for safe fallback by id
      categoriesCache.clear();
      for (const c of cats) categoriesCache.set(c.id, c);
    }
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  // Load articles with filters/pagination
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const run = async () => {
      try {
        const server = await fetchWithFallback<PaginatedResponse<Article>>(
          async () => {
            const res = await articlesService.list({
              title: debouncedSearch || undefined,
              category: debouncedCategory || undefined,
              page,
              limit,
            });
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
              return matchTitle && matchCat;
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

        // Ensure category fallback on API failure or missing category join
        const withSafeCategory = server.data.map((a) => ({
          ...a,
          category: a.category ?? categories.find((c) => c.id === a.categoryId) ?? { id: "", name: "Uncategorized", userId: "", createdAt: "", updatedAt: "" },
        }));

        // Enforce strict limit items per page on UI regardless of API inconsistencies
        const sliced = withSafeCategory.slice(0, limit);
        setArticles(sliced);

        // Normalize pagination fields from API: prefer totalPages/currentPage when available
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
      } catch (e) {
        if (!mounted) return;
        setError("Failed to load articles");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [debouncedSearch, debouncedCategory, page, limit]);

  const categoryOptions = useMemo(() => {
    // Wire to API response only (with "All" option). If categories API fails, fallbackData already used above.
    return [{ id: "", name: "All" }, ...categories.map((c) => ({ id: c.id, name: c.name }))];
  }, [categories]);

  const isLastPage = totalPages ? page >= totalPages : false;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Articles</h1>
        <p className="text-sm text-gray-600">
          Search, filter by category, and browse articles. Pagination is {limit} items
          per page.
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
          className="col-span-2 rounded-md border px-3 py-2 outline-none focus:ring-2 ring-offset-0 ring-blue-500"
        />
        <select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
          className="rounded-md border px-3 py-2 outline-none focus:ring-2 ring-offset-0 ring-blue-500"
        >
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-lg animate-pulse bg-gray-200 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : articles.length === 0 ? (
        <div className="text-sm text-gray-600">No articles found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              className="rounded border px-3 py-1 disabled:opacity-50"
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
              className="rounded border px-3 py-1 disabled:opacity-50"
              onClick={() => setPage((p) => p + 1)}
              disabled={isLastPage}
              aria-label="Next page"
            >
              Next
            </button>
            {typeof totalData === "number" && (
              <span className="text-xs text-gray-500 ml-2">
                {totalData} item{totalData === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

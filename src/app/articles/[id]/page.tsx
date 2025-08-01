"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { articlesService } from "@/services/articles";
import type { Article, PaginatedResponse } from "@/types";
import { fetchWithFallback, fallbackData } from "@/lib/fallback";
import { PAGINATION } from "@/constants/env";

function Breadcrumbs({ article }: { article?: Article }) {
  return (
    <nav className="text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
      <ol className="list-reset flex items-center gap-1">
        <li>
          <Link className="hover:underline" href="/">
            Home
          </Link>
        </li>
        <li>/</li>
        <li>
          <Link className="hover:underline" href="/articles">
            Articles
          </Link>
        </li>
        <li>/</li>
        <li className="text-gray-900 font-medium truncate max-w-[50ch]">
          {article?.title ?? "Detail"}
        </li>
      </ol>
    </nav>
  );
}

function RelatedList({ items, currentId }: { items: Article[]; currentId: string }) {
  if (!items?.length) {
    return <div className="text-sm text-gray-500">No related articles.</div>;
  }
  return (
    <ul className="space-y-2">
      {items
        .filter((a) => a.id !== currentId)
        .map((a) => (
          <li key={a.id}>
            <Link className="text-blue-600 hover:underline" href={`/articles/${a.id}`}>
              {a.title}
            </Link>
            <div className="text-xs text-gray-500">
              {a.category?.name ?? "Uncategorized"}
            </div>
          </li>
        ))}
    </ul>
  );
}

export default function ArticleDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params?.id;

  const [article, setArticle] = useState<Article | undefined>(undefined);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const limit = PAGINATION.defaultLimit;

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!id) return;
      setLoading(true);
      setErr(null);
      try {
        // Load main article (API first, fallback to local)
        const detail = await fetchWithFallback<Article>(
          async () => {
            const res = await articlesService.getById(id);
            return res;
          },
          () => {
            const local = fallbackData.articles.find((a) => a.id === id);
            if (!local) throw new Error("Not found");
            return local as unknown as Article;
          }
        );
        if (!mounted) return;
        setArticle(detail);

        // Load related by same category (API first, fallback)
        const categoryId = detail.categoryId;
        const relatedRes = await fetchWithFallback<PaginatedResponse<Article>>(
          async () => {
            const res = await articlesService.list({
              category: categoryId,
              limit,
              page: 1,
            });
            return res;
          },
          () => {
            const filtered = fallbackData.articles.filter(
              (a) => a.categoryId === categoryId && a.id !== id
            );
            return {
              data: filtered.slice(0, limit),
              page: 1,
              limit,
              total: filtered.length,
              totalData: filtered.length,
              currentPage: 1,
              totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
            };
          }
        );
        if (!mounted) return;
        setRelated(relatedRes.data ?? []);
      } catch (e) {
        if (!mounted) return;
        setErr("Failed to load article");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [id, limit]);

  const nextBack = useMemo(() => searchParams?.get("next") ?? "", [searchParams]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs article={article} />

      {loading ? (
        <div className="space-y-3">
          <div className="h-8 w-2/3 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
          <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
          <div className="h-28 w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
        </div>
      ) : err ? (
        <div className="text-sm text-red-600">{err}</div>
      ) : !article ? (
        <div className="text-sm text-gray-600">Article not found.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <article className="lg:col-span-2 space-y-3">
            <h1 className="text-3xl font-bold">{article.title}</h1>
            <div className="text-sm text-gray-600">
              {article.category?.name ?? "Uncategorized"}
            </div>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{article.content}</p>
            </div>
            <div className="pt-4">
              <Link
                href={nextBack || "/articles"}
                className="inline-block rounded border px-3 py-2 hover:bg-gray-50"
              >
                Back to Articles
              </Link>
            </div>
          </article>

          <aside>
            <h2 className="text-lg font-semibold mb-3">Related</h2>
            <RelatedList items={related} currentId={article.id} />
          </aside>
        </div>
      )}
    </div>
  );
}
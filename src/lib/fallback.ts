import type { Article, Category, PaginatedResponse } from "@/types";

const sampleCategories: Category[] = [
  { id: "c-tech", name: "Technology", userId: "u-1", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-life", name: "Lifestyle", userId: "u-1", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-news", name: "News", userId: "u-2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const sampleArticles: Article[] = [
  {
    id: "a-1",
    title: "Getting started with Next.js App Router",
    content: "This article walks through the basics of the App Router...",
    userId: "u-1",
    categoryId: "c-tech",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: sampleCategories[0],
    user: { id: "u-1", username: "alice", role: "User" },
  },
  {
    id: "a-2",
    title: "Healthy routines for busy developers",
    content: "Balancing work and wellness requires intentional routines...",
    userId: "u-2",
    categoryId: "c-life",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: sampleCategories[1],
    user: { id: "u-2", username: "bob", role: "Admin" },
  },
  {
    id: "a-3",
    title: "Today in tech: frameworks and tools",
    content: "An overview of the latest changes in web tooling...",
    userId: "u-1",
    categoryId: "c-news",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: sampleCategories[2],
    user: { id: "u-1", username: "alice", role: "User" },
  },
];

export async function fetchWithFallback<T>(fn: () => Promise<T>, fallback: T | (() => T)): Promise<T> {
  try {
    return await fn();
  } catch {
    return typeof fallback === "function" ? (fallback as () => T)() : fallback;
  }
}

export function paginateArray<T>(items: T[], page = 1, limit = 9): PaginatedResponse<T> {
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);
  const total = items.length;
  return {
    data,
    total,
    page,
    limit,
    totalData: total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
}

export const fallbackData = {
  categories: sampleCategories,
  articles: sampleArticles,
};
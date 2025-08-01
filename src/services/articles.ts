import { http } from "@/lib/http";
import { PAGINATION } from "@/constants/env";
import type { Article, PaginatedResponse } from "@/types";

export interface ListArticlesParams {
  articleId?: string;
  userId?: string;
  title?: string;
  category?: string;
  createdAtStart?: string; // YYYY-MM-DD
  createdAtEnd?: string;   // YYYY-MM-DD
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const articlesService = {
  async list(params: ListArticlesParams = {}) {
    const { page = 1, limit = PAGINATION.defaultLimit, ...rest } = params;
    const res = await http.get<PaginatedResponse<Article>>("/articles", {
      params: { page, limit, ...rest },
    });
    return res.data;
  },

  async getById(id: string) {
    const res = await http.get<Article>(`/articles/${id}`);
    return res.data;
  },

  async create(input: { title: string; content: string; categoryId: string }) {
    const res = await http.post<Article>("/articles", input);
    return res.data;
  },

  async update(id: string, input: { title: string; content: string; categoryId: string }) {
    const res = await http.put<Article>(`/articles/${id}`, input);
    return res.data;
  },

  async remove(id: string) {
    const res = await http.delete(`/articles/${id}`);
    return res.data as unknown as { success?: boolean };
  },
};
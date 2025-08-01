import { http } from "@/lib/http";
import type { Category, PaginatedResponse } from "@/types";

export interface ListCategoriesParams {
  page?: number; // default: 1
  limit?: number; // default: 10 (API default)
  search?: string;
}

export const categoriesService = {
  async list(params: ListCategoriesParams = {}) {
    const res = await http.get<PaginatedResponse<Category>>("/categories", { params });
    return res.data;
  },

  async create(input: { name: string }) {
    const res = await http.post<Category>("/categories", input);
    return res.data;
  },

  async update(id: string, input: { name: string }) {
    const res = await http.put<Category>(`/categories/${id}`, input);
    return res.data;
  },

  async remove(id: string) {
    const res = await http.delete(`/categories/${id}`);
    return res.data as unknown as { success?: boolean };
  },
};
export type Role = "User" | "Admin";

export interface User {
  id: string;
  username: string;
  role: Role;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Article {
  id: string;
  title: string;
  content: string;
  userId: string;
  categoryId: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  category?: Category;
  user?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalData?: number;
  currentPage?: number;
  totalPages?: number;
}

export interface LoginResponse {
  token: string;
}
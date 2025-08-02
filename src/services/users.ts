import { http } from "@/lib/http";
import type { Role, User } from "@/types";

export interface RegisterInput {
  username: string;
  password: string;
  role: Role;
}

export interface UpdateUserInput {
  username: string;
  role: Role;
  password?: string;
}

export const usersService = {
  // Only register is officially supported per backend; providing minimal admin helpers used by UI.
  async register(input: RegisterInput) {
    const res = await http.post("/auth/register", input);
    return res.data;
  },

  async getById(id: string) {
    // UI expects a single user; backend may not support this in real API, but align with other services' style
    const res = await http.get<User>(`/users/${id}`);
    return res.data;
  },

  async update(id: string, payload: UpdateUserInput) {
    const res = await http.put<User>(`/users/${id}`, payload);
    return res.data;
  },

  async remove(id: string) {
    const res = await http.delete(`/users/${id}`);
    return res.data;
  },
};
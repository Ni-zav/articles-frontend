import { http } from "@/lib/http";
import type { LoginResponse, User } from "@/types";

export interface RegisterInput {
  username: string;
  password: string;
  role?: "User" | "Admin";
}

export const authService = {
  async login(username: string, password: string) {
    const res = await http.post<LoginResponse>("/auth/login", { username, password });
    return res.data;
  },

  async register(data: RegisterInput) {
    const res = await http.post("/auth/register", {
      username: data.username,
      password: data.password,
      role: data.role ?? "User",
    });
    return res.data;
  },

  async profile() {
    const res = await http.get<User>("/auth/profile");
    return res.data;
  },

  async logout() {
    // client-side only: clear token cookie
    if (typeof document !== "undefined") {
      document.cookie = "token=; Max-Age=0; path=/; SameSite=Lax";
    }
  },
};
import { http } from "@/lib/http";
import type { Role } from "@/types";

export interface RegisterInput {
  username: string;
  password: string;
  role: Role;
}

export const usersService = {
  // Only register is supported per backend; no list/get/update/delete
  async register(input: RegisterInput) {
    const res = await http.post("/auth/register", input);
    return res.data;
  },
};
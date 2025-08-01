"use client";

import React from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { getToken, type Role } from "@/lib/auth";
import { http } from "@/lib/http";

async function fetchUserRole(): Promise<Role | undefined> {
  try {
    if (!getToken()) return undefined;
    const res = await http.get("/me");
    const role = (res.data as any)?.role as Role | undefined;
    return role;
  } catch {
    return undefined;
  }
}

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AdminGuard({ children, fallback = null }: AdminGuardProps) {
  return React.createElement(
    AuthGuard as unknown as React.ComponentType<{
      fallback?: React.ReactNode;
      redirectTo?: string;
      roles?: Array<"User" | "Admin">;
      getUserRole?: () => Promise<Role | undefined> | Role | undefined;
      children?: React.ReactNode;
    }>,
    {
      fallback,
      redirectTo: "/login",
      roles: ["Admin"],
      getUserRole: fetchUserRole,
      children,
    }
  );
}
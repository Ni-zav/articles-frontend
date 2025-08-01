"use client";

import React, { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string; // default: /login
  roles?: Array<"User" | "Admin">; // optional role gating
  getUserRole?: () => Promise<"User" | "Admin" | undefined> | ("User" | "Admin" | undefined);
}

/**
 * Client-side guard to protect pages/components.
 * - Ensures token presence, otherwise redirects to /login (or custom).
 * - Optional role-gating: pass roles and getUserRole to restrict by role.
 */
export function AuthGuard({
  children,
  fallback = null,
  redirectTo = "/login",
  roles,
  getUserRole,
}: AuthGuardProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    async function run() {
      const token = getToken();
      if (!token) {
        if (!active) return;
        setAllowed(false);
        setTimeout(() => {
          if (typeof window !== "undefined") window.location.replace(redirectTo);
        }, 0);
        return;
      }

      // role gating if specified
      if (roles && roles.length) {
        try {
          const role = typeof getUserRole === "function" ? await getUserRole() : undefined;
          if (role && roles.includes(role)) {
            if (!active) return;
            setAllowed(true);
            return;
          }
          // If role cannot be determined or not in allowed list, block
          if (!active) return;
          setAllowed(false);
          setTimeout(() => {
            if (typeof window !== "undefined") window.location.replace("/");
          }, 0);
          return;
        } catch {
          if (!active) return;
          setAllowed(false);
          setTimeout(() => {
            if (typeof window !== "undefined") window.location.replace("/");
          }, 0);
          return;
        }
      }

      if (!active) return;
      setAllowed(true);
    }

    run();
    return () => {
      active = false;
    };
  }, [redirectTo, roles, getUserRole]);

  if (allowed === null) return <>{fallback}</>;
  if (allowed === false) return <>{fallback}</>;
  return <>{children}</>;
}
"use client";

import React, { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string; // default: /login
}

/**
 * Client-side guard to protect pages/components.
 * If no token cookie, optionally redirect to /login (or custom) and show fallback while redirecting.
 */
export function AuthGuard({ children, fallback = null, redirectTo = "/login" }: AuthGuardProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAllowed(false);
      // next tick to allow fallback paint
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.replace(redirectTo);
        }
      }, 0);
      return;
    }
    setAllowed(true);
  }, [redirectTo]);

  if (allowed === null) return <>{fallback}</>;
  if (allowed === false) return <>{fallback}</>;
  return <>{children}</>;
}
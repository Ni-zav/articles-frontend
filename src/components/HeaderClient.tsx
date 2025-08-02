"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getToken, clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { http } from "@/lib/http";

type Role = "User" | "Admin";

/**
 * HeaderClient shows auth-aware controls and dynamic nav:
 * - When authenticated: "My Articles", "Create Article", and "Logout"
 * - Admin additionally sees "Admin" dropdown with Articles and Categories
 * - When not authenticated: shows Login/Register links
 */
export default function HeaderClientWrapper() {
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [role, setRole] = useState<Role | undefined>(undefined);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    const token = !!getToken();
    setHasToken(token);
  }, []);

  // Poll auth cookie and fetch role when token present
  useEffect(() => {
    let cancelled = false;

    async function loadRole() {
      try {
        if (!getToken()) {
          if (!cancelled) setRole(undefined);
          return;
        }
        // FIX: align with API docs — use /auth/profile instead of /me
        const res = await http.get("/auth/profile");
        const r = (res.data as any)?.role as Role | undefined;
        if (!cancelled) setRole(r);
      } catch {
        if (!cancelled) setRole(undefined);
      }
    }

    // fetch once initially and whenever token changes
    loadRole();

    const cookiePoll = setInterval(() => {
      const token = !!getToken();
      setHasToken((prev) => (prev !== token ? token : prev));
    }, 2000);
    const rolePoll = setInterval(loadRole, 10000);

    return () => {
      cancelled = true;
      clearInterval(cookiePoll);
      clearInterval(rolePoll);
    };
  }, [hasToken]);

  const handleLogout = useCallback(async () => {
    try {
      clearToken();
    } catch {
      // ignore
    } finally {
      try {
        router.replace("/login");
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      }
    }
  }, [router]);

  return (
    <div className="ml-auto flex items-center gap-2">
      {hasToken ? (
        <>
          <Link
            href="/articles?mine=1"
            className="button button-ghost text-sm"
            aria-label="My Articles"
          >
            My Articles
          </Link>
          <Link
            href="/articles/create"
            className="button button-primary text-sm"
            aria-label="Create Article"
          >
            Create Article
          </Link>

          {role === "Admin" ? (
            <Link
              href="/admin"
              className="button button-outline text-sm"
              aria-label="Admin dashboard"
            >
              Admin
            </Link>
          ) : null}

          <button
            onClick={handleLogout}
            className="button button-outline text-sm"
            aria-label="Logout"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="button button-outline text-sm"
            aria-label="Login"
          >
            Login
          </Link>
          <span className="muted px-1">/</span>
          <Link
            href="/register"
            className="button button-primary text-sm"
            aria-label="Register"
          >
            Register
          </Link>
        </>
      )}
    </div>
  );
}
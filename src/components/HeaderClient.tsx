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
    <div className="ml-auto flex items-center gap-3">
      {/* Left side in layout already has: Home, Articles */}
      {hasToken ? (
        <>
          {/* Authenticated user links */}
          <Link
            href="/articles?mine=1"
            className="text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
            aria-label="My Articles"
          >
            My Articles
          </Link>
          <Link
            href="/articles/create"
            className="text-sm text-white bg-blue-600 hover:bg-blue-700 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Create Article"
          >
            Create Article
          </Link>

          {/* Admin-only link to Admin dashboard (no nested menu) */}
          {role === "Admin" ? (
            <Link
              href="/admin"
              className="text-sm rounded border px-3 py-1 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Admin dashboard"
            >
              Admin
            </Link>
          ) : null}

          <button
            onClick={handleLogout}
            className="rounded border px-3 py-1 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Logout"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1"
            aria-label="Login"
          >
            Login
          </Link>
          <span className="text-gray-300">/</span>
          <Link
            href="/register"
            className="text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1"
            aria-label="Register"
          >
            Register
          </Link>
        </>
      )}
    </div>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getToken, clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

/**
 * HeaderClient shows auth-aware controls:
 * - When authenticated: shows "Logout" button
 * - When not authenticated: shows Login/Register links
 * Handles clearing the auth cookie and redirecting to /login (fallback /) on logout.
 */
export default function HeaderClientWrapper() {
  const [hasToken, setHasToken] = useState<boolean>(false);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    setHasToken(!!getToken());
  }, []);

  // Keep minimal polling to reflect changes from other tabs (optional)
  useEffect(() => {
    const id = setInterval(() => {
      const current = !!getToken();
      setHasToken((prev) => (prev !== current ? current : prev));
    }, 2000);
    return () => clearInterval(id);
  }, []);

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
      {hasToken ? (
        <button
          onClick={handleLogout}
          className="rounded border px-3 py-1 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Logout"
        >
          Logout
        </button>
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
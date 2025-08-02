"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getToken, clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { http } from "@/lib/http";
import type { User } from "@/types";

type Role = "User" | "Admin";

/**
 * HeaderClient shows auth-aware controls and dynamic nav:
 * - Authenticated:
 *   - "Articles" tools dropdown (My Articles, Create Article)
 *   - Profile dropdown (username + avatar, role row, Admin link if admin, Logout)
 * - Guests:
 *   - Login / Register
 */
export default function HeaderClientWrapper() {
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [role, setRole] = useState<Role | undefined>(undefined);
  const [user, setUser] = useState<User | undefined>(undefined);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    const token = !!getToken();
    setHasToken(token);
  }, []);

  // Poll auth cookie and fetch profile when token present
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        if (!getToken()) {
          if (!cancelled) {
            setRole(undefined);
            setUser(undefined);
          }
          return;
        }
        const res = await http.get<User>("/auth/profile");
        const me = res.data;
        if (!cancelled) {
          setRole(me?.role as Role | undefined);
          setUser(me);
        }
      } catch {
        if (!cancelled) {
          setRole(undefined);
          setUser(undefined);
        }
      }
    }

    // fetch once initially and whenever token changes
    loadProfile();

    const cookiePoll = setInterval(() => {
      const token = !!getToken();
      setHasToken((prev) => (prev !== token ? token : prev));
    }, 2000);
    const rolePoll = setInterval(loadProfile, 10000);

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

  // Simple dropdown primitive (no external UI lib)
  function Dropdown({
    trigger,
    items,
    align = "right",
    label,
  }: {
    trigger: React.ReactNode;
    items: React.ReactNode;
    align?: "left" | "right";
    label: string;
  }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative group/root">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={label}
          onClick={() => setOpen((v) => !v)}
          onBlur={(e) => {
            // close when focus leaves the container
            if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
              setOpen(false);
            }
          }}
          className="text-sm inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-orange-500 hover:text-white focus-visible:ring-2 focus-visible:ring-orange-500 transition-colors"
        >
          {trigger}
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className="opacity-70 group-hover:text-white transition-colors">
            <path fill="currentColor" d="M7 10l5 5 5-5z" />
          </svg>
        </button>
        {open ? (
          <div
            role="menu"
            className={`absolute mt-2 min-w-40 z-40 rounded-md bg-[var(--bg)] shadow-lg overflow-hidden border border-[var(--border)] ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            <ul className="py-1">{items}</ul>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="ml-auto flex items-center gap-2">
      {hasToken ? (
        <>
          {/* Articles tools dropdown: My Articles + Create Article */}
          <Dropdown
            label="Article actions"
            trigger={
              <span className="inline-flex items-center gap-2">
                {/* On small screens show only the icon; it still turns white on orange bg */}
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="opacity-90 transition-colors group-hover:text-white">
                  <path fill="currentColor" d="M3 5h18v2H3V5m0 6h18v2H3v-2m0 6h18v2H3v-2z"/>
                </svg>
                <span className="hidden sm:inline transition-colors group-hover:text-white">Articles</span>
              </span>
            }
            items={
              <>
                <li>
                  <Link
                    href="/articles?mine=1"
                    className="nav-dd-item block px-3 py-2 text-sm"
                    aria-label="My Articles"
                  >
                    My Articles
                  </Link>
                </li>
                <li>
                  <Link
                    href="/articles/create"
                    className="nav-dd-item block px-3 py-2 text-sm"
                    aria-label="Create Article"
                  >
                    Create Article
                  </Link>
                </li>
              </>
            }
          />

          {/* Profile dropdown: username (left) + avatar (right on small), role row, Admin link (if admin), Logout */}
          <Dropdown
            label="Profile menu"
            trigger={
              <span className="inline-flex items-center gap-2">
                {/* Username (hidden on very small screens) */}
                <span className="text-sm font-medium truncate max-w-[8rem] sm:max-w-none hidden sm:inline transition-colors group-hover:text-white">
                  {user?.username ?? "User"}
                </span>
                {/* Avatar: keep stable colors on hover; do not change when hovering name or circle */}
                <span
                  aria-hidden="true"
                  className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold bg-[color-mix(in_oklab,var(--primary)_20%,var(--bg))] text-[var(--fg)]"
                >
                  {(user?.username?.[0] ?? "U").toUpperCase()}
                </span>
              </span>
            }
            items={
              <>
                <li className="px-3 py-2 text-xs muted">
                  Role: <span className="font-medium">{role ?? "-"}</span>
                </li>
                {role === "Admin" ? (
                  <li>
                    <Link
                      href="/admin"
                      className="nav-dd-item block px-3 py-2 text-sm"
                      aria-label="Admin dashboard"
                    >
                      Admin
                    </Link>
                  </li>
                ) : null}
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="nav-dd-item w-full text-left block px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-orange-500"
                    aria-label="Logout"
                  >
                    Logout
                  </button>
                </li>
              </>
            }
          />
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
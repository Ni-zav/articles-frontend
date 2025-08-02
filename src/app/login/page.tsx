"use client";

import React, { useState } from "react";
import { authService } from "@/services/auth";
import { saveToken, roleRedirectPath } from "@/lib/auth";
import type { Role } from "@/types";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await authService.login(username, password);
      if (res?.token) {
        saveToken(res.token);
        let role: Role | undefined = "User";
        try {
          const me = await authService.profile();
          role = me?.role;
        } catch {
          // ignore; allow redirect with default
        }
        // Keep loading true until navigation occurs so the button shows "Signing in..."
        window.location.replace(roleRedirectPath(role));
        return;
      } else {
        setErr("Invalid response");
      }
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Login failed");
    } finally {
      // Only clear loading if we are still on the page (i.e., an error occurred)
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4 ui-card">
        <div className="space-y-1">
          <label className="label text-sm">Username</label>
          <input
            className="input text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="label text-sm">Password</label>
          <div className="flex gap-2">
            <input
              className="input text-sm"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="button button-outline text-sm"
              onClick={() => setShowPass((s) => !s)}
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        {err && (
          <div role="alert" className="alert-danger text-sm">
            {err}
          </div>
        )}
        <button
          className="button button-primary text-sm disabled:opacity-50"
          disabled={loading}
          aria-busy={loading}
          aria-label="Login"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
      <p className="text-sm text-[var(--fg-muted)] mt-4">
        No account?{" "}
        <a
          className="underline hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] rounded-sm"
          href="/register"
          aria-disabled={loading}
          onClick={(e) => {
            if (loading) e.preventDefault();
          }}
        >
          Register
        </a>
      </p>
    </div>
  );
}
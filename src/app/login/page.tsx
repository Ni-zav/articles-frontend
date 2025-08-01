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
        window.location.replace(roleRedirectPath(role));
      } else {
        setErr("Invalid response");
      }
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm">Username</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <div className="flex gap-2">
            <input
              className="w-full rounded border px-3 py-2"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="rounded border px-3"
              onClick={() => setShowPass((s) => !s)}
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-4">
        No account?{" "}
        <a className="underline" href="/register">
          Register
        </a>
      </p>
    </div>
  );
}
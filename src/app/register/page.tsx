"use client";

import React, { useState } from "react";
import { authService, type RegisterInput } from "@/services/auth";
import { saveToken, roleRedirectPath } from "@/lib/auth";
import type { Role } from "@/types";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("User");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const payload: RegisterInput = { username, password, role };
      const res = await authService.register(payload);
      // Some backends return token on register, some don't.
      // If register returns token, save and redirect.
      if ((res as any)?.token) {
        saveToken((res as any).token);
        // Try to fetch profile to get role; fallback to selected role.
        let redirectRole: Role | undefined = role ?? "User";
        try {
          const me = await authService.profile();
          redirectRole = me?.role ?? redirectRole;
        } catch {
          // ignore
        }
        window.location.replace(roleRedirectPath(redirectRole));
        return;
      }

      // If no token from register, attempt immediate login to get token.
      try {
        const login = await authService.login(username, password);
        if (login?.token) {
          saveToken(login.token);
          let redirectRole: Role | undefined = role ?? "User";
          try {
            const me = await authService.profile();
            redirectRole = me?.role ?? redirectRole;
          } catch {
            // ignore
          }
          window.location.replace(roleRedirectPath(redirectRole));
        } else {
          // Fallback redirect without token; likely stays public
          window.location.replace("/login");
        }
      } catch {
        // If automatic login fails, send user to login
        window.location.replace("/login");
      }
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
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
              autoComplete="new-password"
              required
              minLength={6}
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

        <div className="space-y-1">
          <label className="text-sm">Role</label>
          <select
            className="w-full rounded border px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <button
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-4">
        Already have an account?{" "}
        <a className="underline" href="/login">
          Login
        </a>
      </p>
    </div>
  );
}
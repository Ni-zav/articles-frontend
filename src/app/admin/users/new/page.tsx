"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usersService } from "@/services/users";
import type { Role } from "@/types";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminUserCreatePage() {
  const router = useRouter();
  const { show } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("User");

  const [touched, setTouched] = useState<{ username?: boolean; password?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);

  const usernameError = useMemo(() => {
    const v = username.trim();
    if (!v) return "Username is required";
    if (v.length < 2) return "Username must be at least 2 characters";
    return "";
  }, [username]);

  const passwordError = useMemo(() => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  }, [password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ username: true, password: true });
    if (usernameError || passwordError) {
      show("Please fix validation errors", { type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      await usersService.register({
        username: username.trim(),
        password,
        role,
      });
      show("User registered", { type: "success" });
      router.replace("/admin"); // users list is not available
      return;
    } catch (err: any) {
      show(err?.response?.data?.message ?? "Failed to register user", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Register User</h1>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <input
            id="username"
            className="input text-sm w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, username: true }))}
            aria-invalid={!!(touched.username && usernameError)}
            aria-describedby={touched.username && usernameError ? "username-error" : undefined}
            required
            minLength={2}
          />
          {touched.username && usernameError ? (
            <p id="username-error" role="alert" className="mt-1 text-sm text-red-600">
              {usernameError}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input text-sm w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            aria-invalid={!!(touched.password && passwordError)}
            aria-describedby={touched.password && passwordError ? "password-error" : undefined}
            required
            minLength={6}
          />
          {touched.password && passwordError ? (
            <p id="password-error" role="alert" className="mt-1 text-sm text-red-600">
              {passwordError}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-1">
            Role
          </label>
          <select
            id="role"
            className="select text-sm w-full"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            required
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="button button-primary text-sm disabled:opacity-50"
            aria-busy={submitting}
            aria-label="Register user"
          >
            {submitting ? "Registering…" : "Register"}
          </button>
          <button
            type="button"
            className="button button-outline text-sm disabled:opacity-50"
            disabled={submitting}
            onClick={() => {
              if (!submitting) router.push("/admin");
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usersService } from "@/services/users";
import type { Role, User } from "@/types";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminUserEditPage() {
  const router = useRouter();
  const params = useParams();
  const { show } = useToast();

  const id = String(params?.id ?? "");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role>("User");
  const [password, setPassword] = useState("");

  const [touched, setTouched] = useState<{ username?: boolean; password?: boolean }>({});

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const u = await usersService.getById(id);
        if (!active) return;
        setUser(u);
        setUsername(u.username ?? "");
        setRole((u.role as Role) ?? "User");
      } catch {
        if (!active) return;
        show("Failed to load user", { type: "error" });
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id, show]);

  const usernameError = useMemo(() => {
    const v = username.trim();
    if (!v) return "Username is required";
    if (v.length < 2) return "Username must be at least 2 characters";
    return "";
  }, [username]);

  const passwordError = useMemo(() => {
    // Optional on edit. Only validate if provided.
    if (!password) return "";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  }, [password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched((t) => ({ ...t, username: true, password: password ? true : t.password }));
    if (usernameError || passwordError) {
      show("Please fix validation errors", { type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      await usersService.update(id, {
        username: username.trim(),
        role,
        ...(password ? { password } : {}),
      });
      show("User updated", { type: "success" });
      // Keep submitting=true until navigation completes
      router.replace("/admin/users");
      return;
    } catch (err: any) {
      show(err?.response?.data?.message ?? "Failed to update user", { type: "error" });
    } finally {
      // Only clear if we remain on the page (error)
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (deleting || submitting) return;
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await usersService.remove(id);
      show("User deleted", { type: "success" });
      // Keep deleting state until redirect
      router.replace("/admin/users");
      return;
    } catch {
      show("Failed to delete user", { type: "error" });
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <section className="p-4" role="status" aria-live="polite" aria-busy="true">
        <p className="text-sm muted">Loading user…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="p-4">
        <p role="alert" className="alert-error text-sm">User not found</p>
        <button
          type="button"
          className="button button-outline text-sm mt-3"
          onClick={() => router.push("/admin/users")}
        >
          Back
        </button>
      </section>
    );
  }

  return (
    <section className="max-w-lg space-y-4" aria-labelledby="edit-user-title">
      <div className="flex items-center justify-between gap-3">
        <h1 id="edit-user-title" className="text-xl font-semibold">Edit User</h1>
        <button
          type="button"
          onClick={onDelete}
          className="button button-danger text-sm disabled:opacity-50"
          disabled={deleting || submitting}
          aria-busy={deleting}
          aria-label="Delete user"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4" aria-describedby={usernameError ? "username-error" : undefined}>
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
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
            <p id="username-error" role="alert" className="mt-1 text-sm text-red-600">{usernameError}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password <span className="text-[var(--fg-muted)]">(optional)</span>
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
            minLength={6}
            placeholder="Leave blank to keep current password"
          />
          {touched.password && passwordError ? (
            <p id="password-error" role="alert" className="mt-1 text-sm text-red-600">{passwordError}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={submitting || deleting}
            className="button button-primary text-sm disabled:opacity-50"
            aria-busy={submitting}
            aria-label="Save user"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            className="button button-outline text-sm disabled:opacity-50"
            disabled={submitting || deleting}
            onClick={() => {
              if (!submitting && !deleting) router.push("/admin/users");
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
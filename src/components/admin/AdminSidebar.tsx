"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

function NavItem({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname?.startsWith(href);
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`relative group flex items-center gap-2 px-3 py-2 rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
          active
            ? "bg-[color-mix(in_oklab,var(--primary)_12%,var(--bg))] text-[var(--fg)] border border-[var(--border)]"
            : "hover:bg-[color-mix(in_oklab,var(--primary)_6%,var(--bg))] text-[var(--fg-muted)] hover:text-[var(--fg)]"
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-0 top-0 h-full w-0.5 rounded-sm ${
            active ? "bg-[var(--primary)]" : "bg-transparent group-hover:bg-[color-mix(in_oklab,var(--primary)_50%,transparent)]"
          }`}
        />
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </Link>
    </li>
  );
}

export default function AdminSidebar() {
  return (
    <aside
      className="w-64 border-r surface"
      aria-label="Admin navigation"
      role="navigation"
    >
      <div className="p-4 border-b">
        <h2 className="text-base font-semibold">Admin</h2>
      </div>
      <nav className="p-3">
        <ul className="space-y-1">
          <NavItem href="/admin" label="Dashboard" />
          <NavItem href="/admin/articles" label="Articles" />
          <NavItem href="/admin/categories" label="Categories" />
        </ul>
      </nav>
    </aside>
  );
}
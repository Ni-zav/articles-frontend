"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 opacity-90">
      <path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
  );
}
function IconArticle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 opacity-90">
      <path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14l4-4h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/>
    </svg>
  );
}
function IconCategory() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 opacity-90">
      <path fill="currentColor" d="M10 3H3v7h7V3zm11 0h-7v7h7V3zM10 14H3v7h7v-7zm11 0h-7v7h7v-7z"/>
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 opacity-90">
      <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3s1.34 3 3 3m-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5S5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5c0-2.33-4.67-3.5-7-3.5m8 0c-.29 0-.62.02-.97.05c1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5"/>
    </svg>
  );
}

function TopNavItem({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname?.startsWith(href);
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
          active
            ? "bg-[color-mix(in_oklab,var(--primary)_12%,var(--bg))] text-[var(--fg)] border border-[var(--border)]"
            : "hover:bg-[color-mix(in_oklab,var(--primary)_6%,var(--bg))] text-[var(--fg-muted)] hover:text-[var(--fg)]"
        }`}
      >
        {icon}
        <span className="hidden sm:inline text-sm font-medium">{label}</span>
      </Link>
    </li>
  );
}

/**
 * AdminTopbar (renamed from AdminSidebar)
 * - Responsive top navigation bar.
 * - No collapsible state; on small screens, labels are hidden (icons only).
 */
export default function AdminTopbar() {
  return (
    <header className="surface border-b sticky top-0 z-30">
      <div className="max-w-screen-2xl mx-auto px-3 md:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold">Admin</span>
        </div>
        <nav aria-label="Admin navigation" role="navigation">
          <ul className="flex items-center gap-1 sm:gap-2">
            <TopNavItem href="/admin" label="Dashboard" icon={<IconDashboard />} />
            <TopNavItem href="/admin/articles" label="Articles" icon={<IconArticle />} />
            <TopNavItem href="/admin/categories" label="Categories" icon={<IconCategory />} />
            <TopNavItem href="/admin/users" label="Users" icon={<IconUsers />} />
          </ul>
        </nav>
      </div>
    </header>
  );
}
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
        className={`flex items-center gap-2 px-3 py-2 rounded-md focus:outline-2 focus:outline-offset-2 focus:outline-blue-600 ${
          active ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
        }`}
      >
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </Link>
    </li>
  );
}

export default function AdminSidebar() {
  return (
    <aside
      className="w-64 border-r bg-white"
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
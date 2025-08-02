"use client";

import React from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminTopbar from "@/components/admin/AdminSidebar"; // renamed component but same file path

export const dynamic = "force-dynamic";

/**
 * Admin layout with a top navigation bar.
 * - No collapsible state/context.
 * - On small screens, topbar shows icons only (labels hidden via CSS in the component).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard fallback={<div className="p-8">Checking access…</div>}>
      <div className="min-h-dvh grid grid-rows-[auto_1fr]">
        <div className="sticky top-0 z-30">
          <AdminTopbar />
        </div>
        <div role="main" className="p-4 md:p-6 overflow-x-auto">
          {children}
        </div>
      </div>
    </AdminGuard>
  );
}
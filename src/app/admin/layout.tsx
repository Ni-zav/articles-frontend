import React from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin | Article Platform",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard fallback={<div className="p-8">Checking access…</div>}>
      <div className="min-h-dvh grid grid-cols-[16rem_1fr]">
        <AdminSidebar />
        <div role="main" className="p-6">{children}</div>
      </div>
    </AdminGuard>
  );
}
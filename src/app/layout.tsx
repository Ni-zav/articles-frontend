import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Article Platform",
  description: "Full-Stack Article Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-[var(--bg)] text-[var(--fg)]`}>
        <ToastProvider>
          <header className="app-header">
            <div className="container py-3 flex items-center gap-4">
              <Link href="/" className="text-base font-semibold hover:opacity-90">Article Platform</Link>
              <Link href="/articles" className="text-sm muted hover:text-foreground">Articles</Link>
              {/* Client header handles auth-aware controls and role-based nav */}
              <HeaderClientWrapper />
            </div>
          </header>
          <main className="container py-6">
            <div className="ui-card p-4">
              {children}
            </div>
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}

import HeaderClientWrapper from "@/components/HeaderClient";
import ToastProvider from "@/components/ui/ToastProvider";
import Link from "next/link";

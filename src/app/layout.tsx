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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh`}>
        <ToastProvider>
          <header className="border-b">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
              <a href="/" className="font-semibold">Home</a>
              <a href="/articles" className="text-sm text-gray-600 hover:text-gray-900">Articles</a>
              {/* Client header handles auth-aware controls and role-based nav */}
              <HeaderClientWrapper />
            </div>
          </header>
          <main>{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}

import HeaderClientWrapper from "@/components/HeaderClient";
import ToastProvider from "@/components/ui/ToastProvider";

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
        <header className="border-b">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
            <a href="/" className="font-semibold">Home</a>
            <a href="/articles" className="text-sm text-gray-600 hover:text-gray-900">Articles</a>
            <button id="app-logout-btn" className="ml-auto rounded border px-3 py-1 text-sm hover:bg-gray-50" aria-label="Logout">
              Logout
            </button>
            <LogoutClientScript />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

/**
 * Client component button to perform logout and redirect.
 * Implemented as an inline client component to keep RootLayout a server component.
 */
function LogoutClientScript() {
  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: `
(function () {
  function onClick(e) {
    e.preventDefault();
    Promise.resolve()
      .then(function () { return import(${JSON.stringify("@/services/auth")}); })
      .then(function (mod) { return mod.authService.logout(); })
      .catch(function () { /* ignore */ })
      .then(function () {
        try { window.location.replace("/login"); }
        catch (_) { window.location.href = "/"; }
      });
  }
  if (document.readyState !== "loading") {
    var btn = document.getElementById("app-logout-btn");
    if (btn) btn.addEventListener("click", onClick, { passive: false });
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      var btn = document.getElementById("app-logout-btn");
      if (btn) btn.addEventListener("click", onClick, { passive: false });
    });
  }
})();`,
      }}
    />
  );
}

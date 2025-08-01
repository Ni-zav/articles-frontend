import { NextRequest, NextResponse } from "next/server";

/**
 * Auth routing rules
 * - Public: "/", "/articles" (and article detail), "/login", "/register", assets
 * - Private: "/dashboard", "/articles/create" (example), any other non-public
 * Middleware protects private server routes by presence of "token" cookie.
 */
const PUBLIC_PREFIXES = [
  "/",
  "/articles",
  "/login",
  "/register",
  "/api", // allow client-side calls to our Next API routes if any
  "/_next",
  "/public",
  "/favicon.ico",
  "/globe.svg",
  "/next.svg",
  "/vercel.svg",
  "/window.svg",
  "/file.svg",
];

// Private path prefixes (expandable)
const PRIVATE_PREFIXES = ["/dashboard", "/articles/create"];

function isPublic(pathname: string): boolean {
  // Treat article detail as public
  if (pathname.startsWith("/articles/")) return true;

  for (const p of PUBLIC_PREFIXES) {
    if (pathname === p || pathname.startsWith(p)) return true;
  }
  return false;
}

function isPrivate(pathname: string): boolean {
  // Include /admin as private as well
  if (pathname === "/admin" || pathname.startsWith("/admin")) return true;
  return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // Redirect authenticated users away from auth pages
  if (token && (pathname === "/login" || pathname === "/register")) {
    const url = req.nextUrl.clone();
    // Send admins to /admin, others to /articles
    // We cannot synchronously know role in middleware without extra calls,
    // so default to articles to avoid 404 to /dashboard.
    url.pathname = "/articles";
    return NextResponse.redirect(url);
  }

  // If private and missing token -> redirect to /login with return path
  if (!token && (isPrivate(pathname) || !isPublic(pathname))) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
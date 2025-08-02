import { NextRequest, NextResponse } from "next/server";

/**
 * Auth routing rules
 * - Public: "/", "/articles" (and article detail), "/login", "/register", assets
 * - Private: "/dashboard", "/articles/create", "/articles?mine=1", any other non-public
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

/**
 * /articles is generally public, but /articles?mine=1 should be treated as private.
 * We cannot include query strings in PUBLIC_PREFIXES, so we special-case in middleware.
 */
function isPublic(pathname: string): boolean {
  // Treat article detail as public
  if (pathname.startsWith("/articles/")) return true;

  for (const p of PUBLIC_PREFIXES) {
    if (pathname === p || pathname.startsWith(p)) return true;
  }
  return false;
}

function isPrivatePath(pathname: string): boolean {
  // Include /admin as private as well
  if (pathname === "/admin" || pathname.startsWith("/admin")) return true;
  return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // Redirect authenticated users away from auth pages
  if (token && (pathname === "/login" || pathname === "/register")) {
    const url = req.nextUrl.clone();
    // Default to articles; role detection is not available here
    url.pathname = "/articles";
    return NextResponse.redirect(url);
  }

  // Special-case: /articles?mine=1 requires auth
  const requestingMine =
    pathname === "/articles" && (searchParams.get("mine") === "1" || searchParams.get("mine") === "true");

  // If private and missing token -> redirect to /login with return path
  if (!token && (isPrivatePath(pathname) || requestingMine || !isPublic(pathname))) {
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
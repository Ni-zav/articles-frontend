import { NextRequest, NextResponse } from "next/server";

// Simple auth middleware scaffold:
// - If request has "token" cookie, consider authenticated.
// - Redirect unauthenticated users trying to access protected paths to /login
// - Redirect authenticated users away from /login and /register to /articles (or dashboard for Admin later)

const PUBLIC_PATHS = ["/", "/articles", "/api", "/_next", "/public", "/favicon.ico", "/globe.svg", "/next.svg", "/vercel.svg", "/window.svg", "/file.svg"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) return true;
  // Treat articles detail as public. If you want to protect, remove this.
  if (pathname.startsWith("/articles/")) return true;
  if (pathname === "/login" || pathname === "/register") return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // Authenticated users should not see login/register
  if (token && (pathname === "/login" || pathname === "/register")) {
    const url = req.nextUrl.clone();
    url.pathname = "/articles";
    return NextResponse.redirect(url);
  }

  // Unauthenticated users visiting protected routes get redirected to /login
  if (!token && !isPublicPath(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // Preserve return url
    url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run for all routes except static assets and api (fine-tuned above in code)
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
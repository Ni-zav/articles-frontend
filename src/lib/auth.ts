"use client";

export type Role = "User" | "Admin";

const TOKEN_COOKIE = "token";
const COOKIE_ATTR = "path=/; SameSite=Lax";

export function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function setCookie(name: string, value: string, maxAgeDays = 7) {
  if (typeof document === "undefined") return;
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; ${COOKIE_ATTR}`;
}

export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; ${COOKIE_ATTR}`;
}

export function getToken(): string | undefined {
  return readCookie(TOKEN_COOKIE);
}

export function saveToken(token: string) {
  setCookie(TOKEN_COOKIE, token);
}

export function clearToken() {
  deleteCookie(TOKEN_COOKIE);
}
 
export function roleRedirectPath(role?: Role): string {
  // Redirect Admins to /admin (we do not use /dashboard)
  if (role === "Admin") return "/admin";
  return "/articles";
}
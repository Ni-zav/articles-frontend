import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://test-fe.mysellerpintar.com/api";

let isRefreshing = false;
let refreshQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function onRefreshed(token: string) {
  refreshQueue.forEach((p) => p.resolve(token));
  refreshQueue = [];
}

function addToQueue() {
  return new Promise<string>((resolve, reject) => {
    refreshQueue.push({ resolve, reject });
  });
}

export function getAccessToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  try {
    const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  } catch {
    return undefined;
  }
}

export function setAccessToken(token: string) {
  if (typeof document === "undefined") return;
  document.cookie = `token=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
}

export function clearAccessToken() {
  if (typeof document === "undefined") return;
  document.cookie = "token=; Max-Age=0; path=/; SameSite=Lax";
}

async function refreshToken(): Promise<string> {
  // Basic refresh stub: hit /auth/profile to validate, or use real refresh endpoint when available.
  // If backend exposes /auth/refresh, replace this with that call.
  const existing = getAccessToken();
  if (!existing) throw new Error("No token to refresh");
  // No real refresh endpoint provided in docs. Simulate success passthrough.
  return existing;
}

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      // Axios v1 uses AxiosHeaders; use set to avoid type issues
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hdrs: any = config.headers ?? {};
      if (typeof hdrs.set === "function") {
        hdrs.set("Authorization", `Bearer ${token}`);
      } else {
        hdrs["Authorization"] = `Bearer ${token}`;
      }
      // reassign in case we created a plain object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (config as any).headers = hdrs;
    }
    return config;
  });

  client.interceptors.response.use(
    (res: any) => res,
    async (error: AxiosError) => {
      const original = error.config as AxiosRequestConfig & { _retry?: boolean };
      const status = error.response?.status;

      // Simple exponential backoff for 5xx up to 2 retries
      const shouldRetry5xx = status && status >= 500 && status < 600;
      if (shouldRetry5xx) {
        const retries = (original as any)._retries ?? 0;
        if (retries < 2) {
          (original as any)._retries = retries + 1;
          const delay = Math.pow(2, retries) * 300;
          await new Promise((r) => setTimeout(r, delay));
          return client(original);
        }
      }

      // 401 handling with queued refresh
      if (status === 401 && !original._retry && original.url !== "/auth/login") {
        original._retry = true;
        if (isRefreshing) {
          const newToken = await addToQueue();
          original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${newToken}` };
          return client(original);
        }
        isRefreshing = true;
        try {
          const newToken = await refreshToken();
          setAccessToken(newToken);
          onRefreshed(newToken);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const hdrs: any = original.headers ?? {};
          if (typeof hdrs.set === "function") {
            hdrs.set("Authorization", `Bearer ${newToken}`);
          } else {
            hdrs["Authorization"] = `Bearer ${newToken}`;
          }
          (original as any).headers = hdrs;
          return client(original);
        } catch (e) {
          clearAccessToken();
          refreshQueue.forEach((p) => p.reject(e));
          refreshQueue = [];
          throw e;
        } finally {
          isRefreshing = false;
        }
      }

      throw error;
    }
  );

  return client;
}

export const http = createClient();
export type { AxiosInstance };
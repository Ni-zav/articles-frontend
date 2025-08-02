import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosHeaders } from "axios";

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

// Type-safe helper to set Authorization header across AxiosHeaders or plain objects
function setAuthHeader(headers: AxiosRequestConfig["headers"] | undefined, token: string) {
  if (!headers) return;
  if (headers instanceof AxiosHeaders) {
    headers.set("Authorization", `Bearer ${token}`);
    return;
  }
  // Headers can be a plain object or array; treat as record
  (headers as Record<string, unknown>)["Authorization"] = `Bearer ${token}`;
}

async function refreshToken(): Promise<string> {
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { timeout: 10000, withCredentials: false });
    const token = (res.data as { token?: string })?.token;
    if (!token) throw new Error("Refresh endpoint did not return token");
    return token;
  } catch {
    throw new Error("Unable to refresh token");
  }
}

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      if (!config.headers) config.headers = new AxiosHeaders();
      setAuthHeader(config.headers, token);
    }
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config as AxiosRequestConfig & { _retry?: boolean; _retries?: number };
      const status = error.response?.status;

      const shouldRetry5xx = status && status >= 500 && status < 600;
      if (shouldRetry5xx) {
        const retries = original._retries ?? 0;
        if (retries < 2) {
          original._retries = retries + 1;
          const delay = Math.pow(2, retries) * 300;
          await new Promise((r) => setTimeout(r, delay));
          return client(original);
        }
      }

      const url = original.url || "";
      const isAuthRoute = url.startsWith("/auth/login") || url.startsWith("/auth/refresh");
      if (status === 401 && !original._retry && !isAuthRoute) {
        original._retry = true;
        if (isRefreshing) {
          const newToken = await addToQueue();
          if (!original.headers) original.headers = new AxiosHeaders();
          setAuthHeader(original.headers, newToken);
          return client(original);
        }
        isRefreshing = true;
        try {
          const newToken = await refreshToken();
          setAccessToken(newToken);
          onRefreshed(newToken);
          if (!original.headers) original.headers = new AxiosHeaders();
          setAuthHeader(original.headers, newToken);
          return client(original);
        } catch (err) {
          clearAccessToken();
          refreshQueue.forEach((p) => p.reject(err));
          refreshQueue = [];
          throw err;
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
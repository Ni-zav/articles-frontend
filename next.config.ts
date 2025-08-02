import type { NextConfig } from "next";

/**
 * Production config:
 * - images.domains populated per user input
 * - Expose NEXT_PUBLIC_API_BASE_URL at build time (consumed from process.env on host)
 *
 * To set on host (e.g., Vercel/Render/Docker):
 *   NEXT_PUBLIC_API_BASE_URL=https://test-fe.mysellerpintar.com/api
 */
const nextConfig: NextConfig = {
  images: {
    domains: ["cdn.example.com", "images.example.com"],
  },
  // If you later need to inspect env at runtime in next.config, you can reference process.env here.
};

export default nextConfig;

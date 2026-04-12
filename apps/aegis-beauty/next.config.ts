import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// next-pwa is a CJS module — use createRequire to import it in a TS/ESM config
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "supabase-cache",
        expiration: { maxEntries: 50 },
      },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: { cacheName: "static-cache" },
    },
  ],
  fallbacks: {
    document: "/offline.html",
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@aegis/ui", "@aegis/core", "@aegis/types"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@aegis/ui", "@aegis/core", "@aegis/types"],
};

export default nextConfig;
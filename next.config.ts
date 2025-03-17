import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    runtime: 'nodejs',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.5'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
     {
      protocol: "https",
      hostname: "skillicons.dev",
      pathname: "/**",
     }
    ],
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
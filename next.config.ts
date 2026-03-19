import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  cacheComponents: true, // Enable 'use cache' directive for KPI proxy
};

export default nextConfig;

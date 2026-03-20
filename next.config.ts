import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // cacheComponents disabled - requires Suspense boundaries on all auth pages
  // KPI caching uses unstable_cache instead
};

export default nextConfig;

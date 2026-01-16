import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable client-side router caching so pages don't re-render on back navigation
  experimental: {
    staleTimes: {
      dynamic: 30, // Cache dynamic pages for 30 seconds client-side
      static: 180, // Cache static pages for 3 minutes client-side
    },
  },
};

export default nextConfig;

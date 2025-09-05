import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    // Do not fail the production build on ESLint errors
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/home-bg.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

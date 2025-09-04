import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow ngrok/dev origins for _next/* in dev per Next.js warning
  experimental: {
    allowedDevOrigins: [
      "http://localhost:3000",
      "https://localhost:3000",
      "http://127.0.0.1:3000",
      "https://127.0.0.1:3000",
      "https://pipfun.ngrok.app",
    ],
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

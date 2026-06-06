import type { NextConfig } from "next";

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org",
              "frame-src https://oauth.telegram.org",
              "connect-src 'self' https://oauth.telegram.org",
              "img-src 'self' data: https: blob:",
              "style-src 'self' 'unsafe-inline'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
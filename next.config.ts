import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "artist-spin-cet-short.trycloudflare.com",
  ],

  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${API_ORIGIN}/uploads/:path*`,
      },
    ];
  },

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
              // dev: localhost + har qanday HTTPS; prod: faqat real API
              isProd
                ? `connect-src 'self' ${API_ORIGIN} https://oauth.telegram.org`
                : "connect-src 'self' http://localhost:4000 http://localhost:3000 https://oauth.telegram.org https:",
              isProd
                ? "img-src 'self' data: https: blob:"
                : "img-src 'self' data: https: blob: http://localhost:4000",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

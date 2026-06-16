import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "artist-spin-cet-short.trycloudflare.com",
  ],

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
                ? `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL} https://oauth.telegram.org`
                : "connect-src 'self' http://localhost:4000 http://localhost:3000 https://oauth.telegram.org https:",
              "img-src 'self' data: https: blob:",
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

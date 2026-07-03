import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**"
      }
    ]
  },
  async redirects() {
    return [
      {
        source: "/index.html",
        destination: "/",
        permanent: true
      }
    ];
  },
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
        ]
      }
    ];
  }
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "mega-ed",
  project: process.env.SENTRY_PROJECT_WEB || "megacompagnon-web",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
  widenClientFileUpload: true
});

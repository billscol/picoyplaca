import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";
const apiOrigin = new URL(apiUrl).origin;

// Report-Only: collects violation reports without blocking anything yet. Tighten and
// switch to the enforcing `Content-Security-Policy` header once real traffic confirms
// no legitimate resource is denied (style-src needs 'unsafe-inline' for the inline
// `style={{ animationDelay }}` used across the marketing components).
const csp = [
  "default-src 'self'",
  "img-src 'self' data:",
  `connect-src 'self' ${apiOrigin}`,
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "frame-ancestors 'none'",
].join("; ");

// /widget/[slug] is an embeddable iframe snippet meant to be framed by third-party
// sites. X-Frame-Options has no valid "allow all" value (only DENY/SAMEORIGIN), so it
// can't be overridden permissive — it must be absent entirely, which means the general
// security-headers block below must not match widget paths at all.
const widgetCsp = [
  "default-src 'self'",
  "img-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "frame-ancestors *",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
  },
  async headers() {
    return [
      {
        source: "/((?!widget/|en/widget/).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy-Report-Only", value: csp },
        ],
      },
      {
        source: "/:locale(en)?/widget/:slug*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy-Report-Only", value: widgetCsp },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

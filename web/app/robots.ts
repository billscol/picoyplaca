import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/login",
        "/registro",
        "/register",
        "/dashboard",
        "/api-keys",
        "/planes",
        "/en/login",
        "/en/register",
        "/en/dashboard",
        "/en/api-keys",
        "/en/plans",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

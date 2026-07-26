import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/navigation";
import { getCities } from "@/lib/pico-placa";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cities = await getCities();
  const entries: MetadataRoute.Sitemap = [];

  const staticPaths = ["/", "/ciudades", "/precios"] as const;
  for (const path of staticPaths) {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = `${siteUrl}${getPathname({ locale, href: path })}`;
    }
    entries.push({
      url: `${siteUrl}${getPathname({ locale: routing.defaultLocale, href: path })}`,
      changeFrequency: path === "/" ? "weekly" : "daily",
      priority: path === "/" ? 1 : 0.7,
      alternates: { languages },
    });
  }

  for (const city of cities) {
    const href = { pathname: "/ciudades/[slug]", params: { slug: city.slug } } as const;
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = `${siteUrl}${getPathname({ locale, href })}`;
    }
    entries.push({
      url: `${siteUrl}${getPathname({ locale: routing.defaultLocale, href })}`,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: { languages },
    });
  }

  return entries;
}

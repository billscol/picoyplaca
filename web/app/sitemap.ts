import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/navigation";
import { getCities, getCityRule } from "@/lib/pico-placa";
import { slugifyCountry } from "@/lib/country-slug";
import { getAllPosts } from "@/lib/blog";

const MIN_CITIES_FOR_HUB = 2;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Bumped manually when static-page copy meaningfully changes — not a request-time timestamp. */
const STATIC_CONTENT_UPDATED = new Date("2026-07-26");

function withDefaultLocale(languages: Record<string, string>): Record<string, string> {
  return { ...languages, "x-default": languages[routing.defaultLocale] };
}

function buildStaticEntries(): MetadataRoute.Sitemap {
  const staticPaths = ["/", "/ciudades", "/precios", "/blog"] as const;
  return staticPaths.map((path) => {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = `${siteUrl}${getPathname({ locale, href: path })}`;
    }
    return {
      url: `${siteUrl}${getPathname({ locale: routing.defaultLocale, href: path })}`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: path === "/" ? "weekly" : ("monthly" as const),
      priority: path === "/" ? 1 : 0.7,
      alternates: { languages: withDefaultLocale(languages) },
    };
  });
}

function buildBlogEntries(): MetadataRoute.Sitemap {
  return getAllPosts().map((post) => {
    const href = { pathname: "/blog/[slug]", params: { slug: post.slug } } as const;
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = `${siteUrl}${getPathname({ locale, href })}`;
    }
    return {
      url: `${siteUrl}${getPathname({ locale: routing.defaultLocale, href })}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: { languages: withDefaultLocale(languages) },
    };
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = [...buildStaticEntries(), ...buildBlogEntries()];

  try {
    const cities = await getCities();
    const cityRules = await Promise.all(cities.map((city) => getCityRule(city.slug)));

    const cityEntries: MetadataRoute.Sitemap = [];
    cities.forEach((city, index) => {
      const rule = cityRules[index];
      if (!rule) return; // no verified rule yet — don't ship a URL that 404s for Googlebot

      const href = { pathname: "/ciudades/[slug]", params: { slug: city.slug } } as const;
      const languages: Record<string, string> = {};
      for (const locale of routing.locales) {
        languages[locale] = `${siteUrl}${getPathname({ locale, href })}`;
      }
      cityEntries.push({
        url: `${siteUrl}${getPathname({ locale: routing.defaultLocale, href })}`,
        lastModified: new Date(rule.rule.last_verified ?? STATIC_CONTENT_UPDATED),
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: { languages: withDefaultLocale(languages) },
      });
    });

    const countryCounts = new Map<string, { name: string; count: number }>();
    for (const city of cities) {
      const slug = slugifyCountry(city.country_name);
      const existing = countryCounts.get(slug);
      countryCounts.set(slug, { name: city.country_name, count: (existing?.count ?? 0) + 1 });
    }

    const countryEntries: MetadataRoute.Sitemap = [...countryCounts.entries()]
      .filter(([, { count }]) => count >= MIN_CITIES_FOR_HUB)
      .map(([countrySlug]) => {
        const href = { pathname: "/ciudades/pais/[country]", params: { country: countrySlug } } as const;
        const languages: Record<string, string> = {};
        for (const locale of routing.locales) {
          languages[locale] = `${siteUrl}${getPathname({ locale, href })}`;
        }
        return {
          url: `${siteUrl}${getPathname({ locale: routing.defaultLocale, href })}`,
          lastModified: STATIC_CONTENT_UPDATED,
          changeFrequency: "weekly" as const,
          priority: 0.8,
          alternates: { languages: withDefaultLocale(languages) },
        };
      });

    return [...staticEntries, ...countryEntries, ...cityEntries];
  } catch {
    // Upstream data API unavailable — still serve a valid sitemap with the static shell
    // instead of a 500, so crawlers keep trusting this URL.
    return staticEntries;
  }
}

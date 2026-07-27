import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link, getPathname } from "@/navigation";
import { CityFilterGrid } from "@/components/marketing/city-filter-grid";
import { getCities, type RestrictionModel } from "@/lib/pico-placa";
import { routing } from "@/i18n/routing";
import { slugifyCountry } from "@/lib/country-slug";

const MIN_CITIES_FOR_HUB = 2;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cities.meta" });
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, getPathname({ locale: l, href: "/ciudades" })])
  );
  languages["x-default"] = languages[routing.defaultLocale];
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: getPathname({ locale, href: "/ciudades" }),
      languages,
    },
  };
}

export default async function CitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cities");
  const tBreadcrumb = await getTranslations("city_page.breadcrumb");
  const cities = await getCities();

  const models: RestrictionModel[] = ["plate_digit_day", "emission_label_zone", "congestion_charge"];
  const modelLabels = Object.fromEntries(
    models.map((model) => [model, t(`restriction_model.${model}`)])
  ) as Record<RestrictionModel, string>;

  const countryCounts = new Map<string, { name: string; count: number }>();
  for (const city of cities) {
    const slug = slugifyCountry(city.country_name);
    const existing = countryCounts.get(slug);
    countryCounts.set(slug, { name: city.country_name, count: (existing?.count ?? 0) + 1 });
  }
  const countryHubs = [...countryCounts.entries()]
    .filter(([, { count }]) => count >= MIN_CITIES_FOR_HUB)
    .sort((a, b) => a[1].name.localeCompare(b[1].name));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: cities.length,
    itemListElement: cities.map((city, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${city.city_name}, ${city.country_name}`,
      url: `${siteUrl}${getPathname({ locale, href: { pathname: "/ciudades/[slug]", params: { slug: city.slug } } })}`,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: tBreadcrumb("home"),
        item: `${siteUrl}${getPathname({ locale, href: "/" })}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tBreadcrumb("cities"),
        item: `${siteUrl}${getPathname({ locale, href: "/ciudades" })}`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="bg-hero-wash">
        <div className="mx-auto max-w-5xl px-4 pt-12 pb-8 text-center sm:pt-16 sm:pb-10">
          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:tracking-[-0.03em]">
            {t("title")}
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mx-auto mt-3 max-w-xl text-lg text-muted-foreground duration-700 delay-150">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {countryHubs.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {countryHubs.map(([slug, { name }]) => (
              <Link
                key={slug}
                href={{ pathname: "/ciudades/pais/[country]", params: { country: slug } }}
                className="rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-foreground/30 hover:bg-secondary"
              >
                {name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-4 pb-14">
        <CityFilterGrid
          cities={cities}
          modelLabels={modelLabels}
          filterAllLabel={t("filter_all")}
          apiErrorLabel={t("api_error")}
        />
      </section>
    </>
  );
}

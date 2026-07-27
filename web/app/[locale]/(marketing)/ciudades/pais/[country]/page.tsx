import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Link, getPathname } from "@/navigation";
import { routing } from "@/i18n/routing";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "@/components/ui/accordion";
import { getCities, type City } from "@/lib/pico-placa";
import { slugifyCountry } from "@/lib/country-slug";
import { MODEL_ICON, MODEL_CHIP_CLASS } from "@/lib/model-visuals";

const MIN_CITIES_FOR_HUB = 2;

async function getCountryCities(countrySlug: string): Promise<{ countryName: string; cities: City[] } | null> {
  const cities = await getCities();
  const matches = cities.filter((c) => slugifyCountry(c.country_name) === countrySlug);
  if (matches.length < MIN_CITIES_FOR_HUB) return null;
  return { countryName: matches[0].country_name, cities: matches };
}

export async function generateStaticParams() {
  const cities = await getCities();
  const counts = new Map<string, number>();
  for (const city of cities) {
    const slug = slugifyCountry(city.country_name);
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count >= MIN_CITIES_FOR_HUB).map(([country]) => ({ country }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}): Promise<Metadata> {
  const { locale, country } = await params;
  const data = await getCountryCities(country);
  if (!data) return {};

  const t = await getTranslations({ locale, namespace: "country_hub" });
  const cityNames = data.cities.map((c) => c.city_name).join(", ");

  const languages = Object.fromEntries(
    routing.locales.map((l) => [
      l,
      getPathname({ locale: l, href: { pathname: "/ciudades/pais/[country]", params: { country } } }),
    ])
  );
  languages["x-default"] = languages[routing.defaultLocale];

  return {
    title: t("meta_title", { country: data.countryName, count: data.cities.length }),
    description: t("meta_description", { country: data.countryName, count: data.cities.length, cities: cityNames }),
    alternates: {
      canonical: getPathname({ locale, href: { pathname: "/ciudades/pais/[country]", params: { country } } }),
      languages,
    },
  };
}

export default async function CountryHubPage({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}) {
  const { locale, country } = await params;
  setRequestLocale(locale);

  const data = await getCountryCities(country);
  if (!data) notFound();

  const { countryName, cities } = data;
  const t = await getTranslations("country_hub");
  const tCities = await getTranslations("cities");
  const tBreadcrumb = await getTranslations("city_page.breadcrumb");

  const models = [...new Set(cities.map((c) => c.restriction_model))];
  const modelLabels = models.map((m) => tCities(`restriction_model.${m}`));
  const cityNameList = new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(
    cities.map((c) => c.city_name)
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const homePath = getPathname({ locale, href: "/" });
  const citiesPath = getPathname({ locale, href: "/ciudades" });
  const pagePath = getPathname({ locale, href: { pathname: "/ciudades/pais/[country]", params: { country } } });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tBreadcrumb("home"), item: `${siteUrl}${homePath}` },
      { "@type": "ListItem", position: 2, name: tBreadcrumb("cities"), item: `${siteUrl}${citiesPath}` },
      { "@type": "ListItem", position: 3, name: countryName, item: `${siteUrl}${pagePath}` },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: cities.length,
    itemListElement: cities.map((city, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: city.city_name,
      url: `${siteUrl}${getPathname({ locale, href: { pathname: "/ciudades/[slug]", params: { slug: city.slug } } })}`,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: t("faq_cities_question", { country: countryName }),
        acceptedAnswer: { "@type": "Answer", text: t("faq_cities_answer", { country: countryName, cities: cityNameList }) },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="bg-hero-wash">
        <div className="mx-auto max-w-3xl px-4 pt-8 pb-6 sm:pt-10">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              {tBreadcrumb("home")}
            </Link>
            {" / "}
            <Link href="/ciudades" className="hover:text-foreground">
              {tBreadcrumb("cities")}
            </Link>
            {" / "}
            <span className="text-foreground">{countryName}</span>
          </nav>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:tracking-[-0.03em]">
            {t("title", { country: countryName })}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t("intro", { country: countryName, count: cities.length, models: modelLabels.join(", ") })}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => {
            const Icon = MODEL_ICON[city.restriction_model];
            return (
              <Link
                key={city.slug}
                href={{ pathname: "/ciudades/[slug]", params: { slug: city.slug } }}
                className="group"
              >
                <Card className="card-hover-lift h-full border-2 border-foreground/8 p-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <span
                        className={`flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${MODEL_CHIP_CLASS[city.restriction_model]}`}
                      >
                        <Icon className="size-5" />
                      </span>
                      <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                    </div>
                    <CardTitle as="h2" className="mt-3 text-base font-bold">
                      {city.city_name}
                    </CardTitle>
                    <CardDescription>{city.region ?? countryName}</CardDescription>
                    <Badge variant="secondary" className="mt-2 w-fit">
                      {tCities(`restriction_model.${city.restriction_model}`)}
                    </Badge>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight">{t("faq_title", { country: countryName })}</h2>
          <Card className="card-hover-lift mt-5 border-2 border-foreground/8 p-2">
            <Accordion>
              <AccordionItem value="cities" className="px-4">
                <AccordionTrigger>{t("faq_cities_question", { country: countryName })}</AccordionTrigger>
                <AccordionPanel>{t("faq_cities_answer", { country: countryName, cities: cityNameList })}</AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>
      </section>
    </>
  );
}

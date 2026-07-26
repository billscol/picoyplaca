import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Link, getPathname } from "@/navigation";
import { routing } from "@/i18n/routing";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "@/components/ui/accordion";
import { RestrictionSchedule } from "@/components/marketing/restriction-schedule";
import { CityRegionSection } from "@/components/marketing/city-region-section";
import { CityContactSection } from "@/components/marketing/city-contact-section";
import { CityLegalSection } from "@/components/marketing/city-legal-section";
import { PlateDigitLookup } from "@/components/marketing/plate-digit-lookup";
import { buildCitySeo, type Translator } from "@/lib/city-seo";
import { findParticularesCategory, getCities, getCityRule, type PlateDigitDayPayload } from "@/lib/pico-placa";
import { getTodayDateLabel } from "@/lib/schedule-format";
import { MODEL_ICON, MODEL_CHIP_CLASS } from "@/lib/model-visuals";

function formatDate(value: string | undefined, locale: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date);
}

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const data = await getCityRule(slug);
  if (!data) return {};

  const t = (await getTranslations({ locale, namespace: "city_page" })) as unknown as Translator;
  const seo = buildCitySeo(data, locale, t);

  const languages = Object.fromEntries(
    routing.locales.map((l) => [
      l,
      getPathname({ locale: l, href: { pathname: "/ciudades/[slug]", params: { slug } } }),
    ])
  );

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: getPathname({ locale, href: { pathname: "/ciudades/[slug]", params: { slug } } }),
      languages,
    },
  };
}

export default async function CityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const data = await getCityRule(slug);
  if (!data) {
    notFound();
  }

  const { city, rule } = data;
  const t = (await getTranslations({ locale, namespace: "city_page" })) as unknown as Translator;
  const tCities = await getTranslations({ locale, namespace: "cities" });
  const seo = buildCitySeo(data, locale, t);
  const allCities = await getCities();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const homePath = getPathname({ locale, href: "/" });
  const citiesPath = getPathname({ locale, href: "/ciudades" });
  const pagePath = getPathname({ locale, href: { pathname: "/ciudades/[slug]", params: { slug } } });

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seo.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("breadcrumb.home"), item: `${siteUrl}${homePath}` },
      { "@type": "ListItem", position: 2, name: t("breadcrumb.cities"), item: `${siteUrl}${citiesPath}` },
      { "@type": "ListItem", position: 3, name: city.city_name, item: `${siteUrl}${pagePath}` },
    ],
  };

  const effectiveFrom = formatDate(rule.effective_from, locale);
  const lastVerified = formatDate(rule.last_verified, locale);
  const todayLabel = getTodayDateLabel(city.timezone ?? "America/Bogota", locale);
  const Icon = MODEL_ICON[city.restriction_model];
  const particularesCategory =
    city.restriction_model === "plate_digit_day"
      ? findParticularesCategory(rule.payload as PlateDigitDayPayload)
      : undefined;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="bg-hero-wash">
        <div className="mx-auto max-w-3xl px-4 pt-10 pb-8 sm:pt-14">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              {t("breadcrumb.home")}
            </Link>
            {" / "}
            <Link href="/ciudades" className="hover:text-foreground">
              {t("breadcrumb.cities")}
            </Link>
            {" / "}
            <span className="text-foreground">{city.city_name}</span>
          </nav>

          <div className="mt-6 flex items-start gap-4">
            <span
              className={`hidden size-16 shrink-0 animate-in zoom-in fade-in items-center justify-center rounded-2xl duration-500 sm:flex ${MODEL_CHIP_CLASS[city.restriction_model]}`}
            >
              <Icon className="size-7" />
            </span>
            <div className="animate-in fade-in slide-in-from-bottom-4 min-w-0 duration-700">
              <p className="text-sm font-medium text-muted-foreground capitalize">{todayLabel}</p>
              <h1 className="mt-1 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:tracking-[-0.03em]">
                {city.city_name}, {city.country_name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{tCities(`restriction_model.${city.restriction_model}`)}</Badge>
                <span className="text-xs text-muted-foreground">
                  {effectiveFrom ? t("labels.effective_from", { date: effectiveFrom }) : null}
                  {lastVerified ? ` · ${t("labels.last_verified", { date: lastVerified })}` : null}
                </span>
              </div>
            </div>
          </div>

          <p className="animate-in fade-in fill-mode-both mt-6 max-w-2xl text-base leading-relaxed duration-700 delay-150">
            {seo.intro}
          </p>

          {particularesCategory && particularesCategory.schedule.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-6 duration-700 delay-200">
              <PlateDigitLookup
                schedule={particularesCategory.schedule}
                allDay={particularesCategory.all_day}
                digitPosition={particularesCategory.digit_position}
                locale={locale}
              />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="mt-2">
          <RestrictionSchedule
            model={city.restriction_model}
            payload={rule.payload}
            timezone={city.timezone ?? "America/Bogota"}
            locale={locale}
            t={t}
          />
        </div>

        {rule.source_url && (
          <a
            href={rule.source_url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold transition-colors hover:border-foreground/30 hover:bg-secondary"
          >
            {t("labels.source_link")}
            <ExternalLink className="size-3.5" />
          </a>
        )}

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <CityRegionSection city={city} allCities={allCities} t={t} />
          <CityContactSection city={city} t={t} />
        </div>

        {city.country_code === "CO" && (
          <div className="mt-4">
            <CityLegalSection t={t} />
          </div>
        )}

        <div className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("labels.faq_title", { city: city.city_name })}
          </h2>
          <Card className="card-hover-lift mt-6 border-border p-2 shadow-(--shadow-subtle)">
            <Accordion>
              {seo.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="px-4">
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionPanel>{faq.answer}</AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </section>
    </>
  );
}

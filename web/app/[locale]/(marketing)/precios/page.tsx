import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link, getPathname } from "@/navigation";
import { routing } from "@/i18n/routing";

interface Plan {
  code: string;
  name: string;
  price_monthly_usd: string;
  requests_month_quota: number;
  burst_per_minute: number;
}

async function getPlans(): Promise<Plan[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/plans`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing.meta" });
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, getPathname({ locale: l, href: "/precios" })])
  );
  languages["x-default"] = languages[routing.defaultLocale];
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: getPathname({ locale, href: "/precios" }),
      languages,
    },
  };
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricing");
  const plans = await getPlans();

  const featuredIndex = Math.floor(plans.length / 2);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const pricingJsonLd =
    plans.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Pico y Placa Global API",
          serviceType: "Vehicle restriction data API",
          provider: { "@type": "Organization", name: "Pico y Placa Global", url: siteUrl },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "API plans",
            itemListElement: plans.map((plan) => ({
              "@type": "Offer",
              name: plan.name,
              url: `${siteUrl}${getPathname({ locale, href: "/precios" })}`,
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: plan.price_monthly_usd,
                priceCurrency: "USD",
                billingDuration: "P1M",
                unitText:
                  plan.requests_month_quota < 0
                    ? "unlimited requests/month"
                    : `${plan.requests_month_quota} requests/month`,
              },
            })),
          },
        }
      : null;

  const faqItems = t.raw("faq.items") as { question: string; answer: string }[];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      {pricingJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="bg-hero-wash">
        <div className="mx-auto max-w-5xl px-4 pt-16 pb-8 text-center sm:pt-24">
          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:tracking-[-0.03em]">
            {t("title")}
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mx-auto mt-3 max-w-xl text-lg text-muted-foreground duration-700 delay-150">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan, i) => {
            const featured = i === featuredIndex && plans.length > 1;
            return (
              <div
                key={plan.code}
                className="relative animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {featured && (
                  <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {t("featured")}
                  </span>
                )}
                <Card
                  className={`card-hover-lift h-full ${
                    featured ? "border-2 border-primary shadow-(--shadow-hover)" : "border-border"
                  }`}
                >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-3xl font-bold tracking-tight">
                    ${plan.price_monthly_usd}
                    <span className="text-sm font-normal text-muted-foreground">{t("month")}</span>
                  </p>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>
                    {plan.requests_month_quota < 0
                      ? t("unlimited_requests")
                      : t("requests_per_month", { count: plan.requests_month_quota.toLocaleString() })}
                  </p>
                  <p>{t("requests_per_minute", { count: plan.burst_per_minute })}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${featured ? "bg-primary text-primary-foreground hover:bg-primary/85" : ""}`}
                    variant={featured ? undefined : "outline"}
                    render={<Link href="/register" />}
                    nativeButton={false}
                  >
                    {t("cta")}
                  </Button>
                </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="mt-16">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">{t("faq.title")}</h2>
          <Card className="card-hover-lift mx-auto mt-6 max-w-2xl border-2 border-foreground/8 p-2">
            <Accordion>
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="px-4">
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionPanel>{item.answer}</AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </section>
    </>
  );
}

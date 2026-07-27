import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Zap, ArrowUpRight, MapPinned, LayoutGrid, ShieldCheck, HelpCircle } from "lucide-react";
import { Link, getPathname } from "@/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "@/components/ui/accordion";
import { getCities, type RestrictionModel } from "@/lib/pico-placa";
import { MODEL_ICON, MODEL_CHIP_CLASS } from "@/lib/model-visuals";
import { PicoPlacaFinder } from "@/components/marketing/pico-placa-finder";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, getPathname({ locale: l, href: "/" })])
  );
  languages["x-default"] = languages[routing.defaultLocale];
  return {
    alternates: {
      canonical: getPathname({ locale, href: "/" }),
      languages,
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("hero");
  const tHow = await getTranslations("how_it_works");
  const tCities = await getTranslations("cities");
  const tCitiesSection = await getTranslations("cities_section");
  const tFaq = await getTranslations("faq");
  const tCta = await getTranslations("final_cta");

  const cities = await getCities();
  const faqItems = tFaq.raw("items") as { question: string; answer: string }[];

  const models: RestrictionModel[] = ["plate_digit_day", "emission_label_zone", "congestion_charge"];

  const stats = [
    { icon: MapPinned, value: String(cities.length), label: t("stats.cities_label") },
    { icon: LayoutGrid, value: String(models.length), label: t("stats.models_label") },
    { icon: ShieldCheck, value: "100%", label: t("stats.verified_label") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-wash">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-14 text-center sm:py-20">
          <span className="animate-in fade-in zoom-in fill-mode-both inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground duration-500">
            <Zap className="size-3 text-primary" fill="currentColor" strokeWidth={0} />
            {t("eyebrow")}
          </span>
          <h1 className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both text-4xl font-bold tracking-tight text-balance duration-700 delay-100 sm:text-5xl md:text-6xl md:tracking-[-0.03em]">
            {t("title")}
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both max-w-2xl text-lg text-muted-foreground duration-700 delay-200">
            {t("subtitle")}
          </p>
          <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both flex flex-wrap items-center justify-center gap-3 pt-1 duration-700 delay-300">
            <Button
              size="lg"
              className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/85"
              render={<Link href="/ciudades" />}
              nativeButton={false}
            >
              {t("cta_primary")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-6"
              render={<a href={process.env.NEXT_PUBLIC_DOCS_URL ?? "http://localhost:3012/docs"} />}
              nativeButton={false}
            >
              {t("cta_secondary")}
            </Button>
          </div>

          {cities.length > 0 && (
            <div className="flex w-full justify-center pt-5">
              <PicoPlacaFinder cities={cities} />
            </div>
          )}

          <div className="animate-in fade-in fill-mode-both flex flex-wrap items-center justify-center gap-3 pt-2 duration-700 delay-500 sm:gap-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-full border-2 border-foreground/8 bg-white px-4 py-2"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-sm font-extrabold">{value}</span>
                  <span className="block text-[0.65rem] font-medium text-muted-foreground">{label}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{tHow("title")}</h2>
          <p className="mt-2 text-muted-foreground">{tHow("subtitle")}</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {models.map((model, i) => {
            const Icon = MODEL_ICON[model];
            return (
              <Card
                key={model}
                className="card-hover-lift animate-in fade-in slide-in-from-bottom-4 fill-mode-both border-2 border-foreground/8 p-2 duration-500"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardHeader>
                  <span
                    className={`mb-1 flex size-14 items-center justify-center rounded-2xl transition-transform duration-300 hover:scale-110 ${MODEL_CHIP_CLASS[model]}`}
                  >
                    <Icon className="size-6.5" />
                  </span>
                  <CardTitle className="text-base font-bold">{tCities(`restriction_model.${model}`)}</CardTitle>
                  <CardDescription className="text-sm">{tHow(`${model}_desc`)}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Ciudades disponibles */}
      {cities.length > 0 && (
        <section className="bg-section-wash">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{tCitiesSection("title")}</h2>
              <p className="mt-2 text-muted-foreground">{tCitiesSection("subtitle")}</p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cities.slice(0, 8).map((city, i) => {
                const Icon = MODEL_ICON[city.restriction_model];
                return (
                  <Link
                    key={city.slug}
                    href={{ pathname: "/ciudades/[slug]", params: { slug: city.slug } }}
                    className="group animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500"
                    style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
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
                        <CardTitle className="mt-3 text-base font-bold">{city.city_name}</CardTitle>
                        <CardDescription>{city.country_name}</CardDescription>
                        <Badge variant="secondary" className="mt-2 w-fit">
                          {tCities(`restriction_model.${city.restriction_model}`)}
                        </Badge>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                className="rounded-full px-6"
                render={<Link href="/ciudades" />}
                nativeButton={false}
              >
                {tCitiesSection("cta")}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{tFaq("title")}</h2>
          <p className="mt-2 text-muted-foreground">{tFaq("subtitle")}</p>
        </div>
        <Card className="card-hover-lift mt-8 border-2 border-foreground/8 p-2">
          <Accordion>
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="px-4">
                <AccordionTrigger>
                  <span className="flex items-center gap-2.5">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                      <HelpCircle className="size-3.5" />
                    </span>
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionPanel className="pl-9.5">{item.answer}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="bg-hero-wash card-hover-lift flex flex-col items-center gap-4 rounded-2xl border-2 border-foreground/8 px-6 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-foreground text-primary">
            <Zap className="size-6.5" fill="currentColor" strokeWidth={0} />
          </span>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{tCta("title")}</h2>
          <p className="max-w-xl text-muted-foreground">{tCta("subtitle")}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/85"
              render={<Link href="/precios" />}
              nativeButton={false}
            >
              {tCta("cta_primary")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-6"
              render={<Link href="/register" />}
              nativeButton={false}
            >
              {tCta("cta_secondary")}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

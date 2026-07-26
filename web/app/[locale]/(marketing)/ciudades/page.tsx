import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CityFilterGrid } from "@/components/marketing/city-filter-grid";
import { getCities, type RestrictionModel } from "@/lib/pico-placa";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cities.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function CitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cities");
  const cities = await getCities();

  const models: RestrictionModel[] = ["plate_digit_day", "emission_label_zone", "congestion_charge"];
  const modelLabels = Object.fromEntries(
    models.map((model) => [model, t(`restriction_model.${model}`)])
  ) as Record<RestrictionModel, string>;

  return (
    <>
      <section className="bg-hero-wash">
        <div className="mx-auto max-w-5xl px-4 pt-16 pb-10 text-center sm:pt-24 sm:pb-14">
          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:tracking-[-0.03em]">
            {t("title")}
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mx-auto mt-3 max-w-xl text-lg text-muted-foreground duration-700 delay-150">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
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

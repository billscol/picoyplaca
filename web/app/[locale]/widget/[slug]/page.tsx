import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Zap, CircleCheck, CircleAlert } from "lucide-react";
import { getCityRule, findParticularesCategory, type PlateDigitDayPayload } from "@/lib/pico-placa";
import { getTodayRestriction, formatDigitList, formatHours } from "@/lib/schedule-format";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return { robots: { index: false, follow: true } };
}

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const data = await getCityRule(slug);
  if (!data) notFound();

  const { city, rule } = data;
  const t = await getTranslations({ locale, namespace: "widget" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let restricted = false;
  let statusLine = t("check_status");

  if (city.restriction_model === "plate_digit_day") {
    const particulares = findParticularesCategory(rule.payload as PlateDigitDayPayload);
    if (particulares && particulares.schedule.length > 0) {
      const today = getTodayRestriction(particulares.schedule, city.timezone ?? "America/Bogota");
      if (today) {
        restricted = true;
        statusLine = t("restricted_digits", {
          digits: formatDigitList(today.digits, locale),
          hours: formatHours(today.hours, locale),
        });
      } else {
        statusLine = t("free_today");
      }
    } else {
      statusLine = t("no_restriction");
    }
  }

  return (
    <a
      href={`${siteUrl}/ciudades/${slug}`}
      target="_top"
      rel="noopener"
      className="flex flex-col gap-2 rounded-2xl border-2 border-foreground/10 bg-white p-3.5 no-underline shadow-(--shadow-hover)"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-primary">
          <Zap className="size-3.5" fill="currentColor" strokeWidth={0} />
        </span>
        <span className="text-sm font-bold tracking-tight text-foreground">{city.city_name}</span>
      </div>
      <div className="flex items-start gap-2">
        {restricted ? (
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-vermillion" />
        ) : (
          <CircleCheck className="mt-0.5 size-4 shrink-0 text-foreground" />
        )}
        <span className="text-xs leading-snug text-muted-foreground">{statusLine}</span>
      </div>
      <span className="text-[0.65rem] font-medium text-muted-foreground/70">{t("attribution")}</span>
    </a>
  );
}

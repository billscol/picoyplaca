import { Car, Bike, CarTaxiFront, Bus, Truck, Van, Route, CalendarOff, CalendarCheck2, ChevronDown, Clock } from "lucide-react";
import type { CategoryKey, PlateCategory, PlateDigitDayPayload } from "@/lib/pico-placa";
import type { Translator } from "@/lib/city-seo";
import { buildWeekStrip, formatHours, getTodayRestriction, shortDayLabel, type WeekStripDay } from "@/lib/schedule-format";
import { TodayStatus } from "@/components/marketing/today-status-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<CategoryKey, typeof Car> = {
  particulares: Car,
  motos: Bike,
  taxis: CarTaxiFront,
  transporte_publico_colectivo: Bus,
  transporte_carga: Truck,
  transporte_especial: Van,
  regional: Route,
};

/** Chip accent: fixed daily schedule (primary data) vs. multi-rule vs. rotating/variable note. */
function categoryChipClass(category: PlateCategory): string {
  if (category.schedule.length > 0) return "bg-foreground text-primary";
  if (category.sub_rules && category.sub_rules.length > 0) return "bg-magenta-pop/15 text-magenta-pop";
  return "bg-vermillion/12 text-vermillion";
}

function WeekStrip({
  category,
  locale,
  t,
}: {
  category: PlateCategory;
  locale: string;
  t: Translator;
}) {
  const days = buildWeekStrip(category.schedule);
  const hourGroups: WeekStripDay["hours"][] = [];
  const seen = new Set<string>();
  for (const d of days) {
    if (d.restricted && d.hours) {
      const key = JSON.stringify(d.hours);
      if (!seen.has(key)) {
        seen.add(key);
        hourGroups.push(d.hours);
      }
    }
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => (
          <div
            key={d.day}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-center transition-transform duration-200 hover:scale-105",
              d.restricted ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
            )}
          >
            <span className="text-[0.65rem] font-bold tracking-wide uppercase opacity-70">
              {shortDayLabel(d.day, locale)}
            </span>
            <span className="text-sm font-extrabold">{d.restricted ? d.digits.join("·") : "–"}</span>
          </div>
        ))}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        {category.all_day ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Clock className="size-3" /> {t("today.all_day")}
          </span>
        ) : (
          hourGroups.map((hours, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Clock className="size-3" /> {formatHours(hours, locale)}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  timezone,
  locale,
  t,
  index,
}: {
  category: PlateCategory;
  timezone: string;
  locale: string;
  t: Translator;
  index: number;
}) {
  const Icon = CATEGORY_ICON[category.key] ?? Car;
  const label = t(`categories.${category.key}`);
  const entryStyle = { animationDelay: `${index * 90}ms` };
  const entryClass = "animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500";

  if (category.schedule.length === 0) {
    const hasSubRules = Boolean(category.sub_rules && category.sub_rules.length > 0);
    const hasDetail = Boolean(category.note && (hasSubRules || category.note !== category.note_short));

    return (
      <Card className={`card-hover-lift border-2 border-foreground/8 ${entryClass}`} style={entryStyle}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                categoryChipClass(category)
              )}
            >
              <Icon className="size-5" />
            </span>
            <CardTitle as="h3" className="text-base font-bold">{label}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {hasSubRules ? (
            <>
              {category.note_short && <p className="text-sm font-semibold text-foreground">{category.note_short}</p>}
              <ul className="space-y-2">
                {category.sub_rules!.map((rule, i) => (
                  <li key={i} className="rounded-xl border border-border bg-secondary/50 px-3.5 py-3">
                    <p className="text-sm font-bold">{rule.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{rule.detail}</p>
                  </li>
                ))}
              </ul>
              {hasDetail && (
                <details className="group">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-semibold text-foreground hover:underline [&::-webkit-details-marker]:hidden">
                    {t("labels.see_detail")}
                    <ChevronDown className="size-3.5 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{category.note}</p>
                </details>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">
                {category.note_short ?? category.note ?? t("plate_digit_day.none_note")}
              </p>
              {hasDetail && (
                <details className="group">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-semibold text-foreground hover:underline [&::-webkit-details-marker]:hidden">
                    {t("labels.see_detail")}
                    <ChevronDown className="size-3.5 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{category.note}</p>
                </details>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  const todayEntry = getTodayRestriction(category.schedule, timezone);

  return (
    <Card className={`card-hover-lift border-2 border-foreground/8 shadow-(--shadow-subtle) ${entryClass}`} style={entryStyle}>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", categoryChipClass(category))}>
            <Icon className="size-5" />
          </span>
          <CardTitle as="h3" className="text-base font-bold">{label}</CardTitle>
          {category.digit_position === "first" && (
            <Badge variant="outline">{t("labels.digit_position_first")}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <TodayStatus todayEntry={todayEntry} allDay={category.all_day} locale={locale} t={t} size="md" />

        <WeekStrip category={category} locale={locale} t={t} />

        {category.exceptions && category.exceptions.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">{t("labels.exceptions_title")}</p>
            <div className="flex flex-wrap gap-1.5">
              {category.exceptions.map((code) => {
                const key = `exceptions.${code}`;
                const exceptionLabel = t(key);
                return (
                  <Badge key={code} variant="secondary">
                    {exceptionLabel === key ? code.replace(/_/g, " ") : exceptionLabel}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground">
          {category.holidays_suspended ? (
            <CalendarOff className="size-4 shrink-0" />
          ) : (
            <CalendarCheck2 className="size-4 shrink-0" />
          )}
          <span>{t(category.holidays_suspended ? "labels.holidays_suspended" : "labels.holidays_active")}</span>
        </div>

        {category.note && (
          <details className="group">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-semibold text-foreground hover:underline [&::-webkit-details-marker]:hidden">
              {t("labels.see_detail")}
              <ChevronDown className="size-3.5 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{category.note}</p>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

export function PlateZoneSchedule({
  payload,
  timezone,
  locale,
  t,
}: {
  payload: PlateDigitDayPayload;
  timezone: string;
  locale: string;
  t: Translator;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {payload.categories.map((category, i) => (
        <CategoryCard key={category.key} category={category} timezone={timezone} locale={locale} t={t} index={i} />
      ))}
    </div>
  );
}

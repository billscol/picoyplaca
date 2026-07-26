import { Car, Bike, CarTaxiFront, Bus, Truck, Van, Route, CalendarOff, CalendarCheck2, ChevronDown } from "lucide-react";
import type { CategoryKey, PlateCategory, PlateDigitDayPayload } from "@/lib/pico-placa";
import type { Translator } from "@/lib/city-seo";
import { dayLabel, formatHours, getTodayRestriction } from "@/lib/schedule-format";
import { TodayStatus } from "@/components/marketing/today-status-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CATEGORY_ICON: Record<CategoryKey, typeof Car> = {
  particulares: Car,
  motos: Bike,
  taxis: CarTaxiFront,
  transporte_publico_colectivo: Bus,
  transporte_carga: Truck,
  transporte_especial: Van,
  regional: Route,
};

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
    const hasDetail = Boolean(category.note && category.note !== category.note_short);

    return (
      <Card className={`card-hover-lift border-border ${entryClass}`} style={entryStyle}>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <Icon className="size-4" />
            </span>
            <CardTitle>{label}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {category.sub_rules && category.sub_rules.length > 0 ? (
            <>
              {category.note_short && <p className="text-sm text-muted-foreground">{category.note_short}</p>}
              <ul className="space-y-2">
                {category.sub_rules.map((rule, i) => (
                  <li key={i} className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                    <p className="text-sm font-semibold">{rule.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{rule.detail}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <CalendarCheck2 className="size-5 shrink-0 text-primary" />
                <p className="text-sm text-foreground">
                  {category.note_short ?? category.note ?? t("plate_digit_day.none_note")}
                </p>
              </div>
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
    <Card
      className={`card-hover-lift border-border shadow-(--shadow-subtle) ${entryClass}`}
      style={entryStyle}
    >
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-foreground">
            <Icon className="size-4" />
          </span>
          <CardTitle>{label}</CardTitle>
          {category.digit_position === "first" && (
            <Badge variant="outline">{t("labels.digit_position_first")}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <TodayStatus todayEntry={todayEntry} allDay={category.all_day} locale={locale} t={t} />

        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {category.schedule.map((entry) => (
            <li
              key={entry.day}
              className="flex flex-col gap-2 bg-white px-4 py-3 transition-colors hover:bg-secondary/60 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-semibold">{dayLabel(entry.day, locale)}</span>
              <div className="flex flex-wrap items-center gap-2">
                {entry.digits.map((digit) => (
                  <span
                    key={digit}
                    className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground transition-transform duration-200 hover:scale-110"
                  >
                    {digit}
                  </span>
                ))}
                <span className="text-xs text-muted-foreground">
                  {category.all_day ? t("today.all_day") : formatHours(entry.hours, locale)}
                </span>
              </div>
            </li>
          ))}
        </ul>

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

        <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
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

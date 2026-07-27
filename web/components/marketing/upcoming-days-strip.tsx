import type { PlateDigitDaySchedule } from "@/lib/pico-placa";
import type { Translator } from "@/lib/city-seo";
import { buildUpcomingDays, formatHours } from "@/lib/schedule-format";

export function UpcomingDaysStrip({
  schedule,
  timezone,
  locale,
  t,
}: {
  schedule: PlateDigitDaySchedule[];
  timezone: string;
  locale: string;
  t: Translator;
}) {
  const days = buildUpcomingDays(schedule, timezone, 7);
  const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <div className="rounded-2xl border-2 border-foreground/10 bg-white p-4 shadow-(--shadow-hover)">
      <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {t("labels.upcoming_days_title")}
      </p>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => (
          <div
            key={d.date.toISOString()}
            className={
              "flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-center " +
              (d.restricted ? "bg-foreground text-background" : "bg-secondary text-muted-foreground")
            }
          >
            <span className="text-[0.6rem] font-bold tracking-wide uppercase opacity-70">
              {dayFormatter.format(d.date).replace(/\.$/, "")}
            </span>
            <span className="text-sm font-extrabold">{dateFormatter.format(d.date)}</span>
            <span className="text-[0.6rem] font-semibold">
              {d.restricted ? d.digits.join("·") : "–"}
            </span>
          </div>
        ))}
      </div>
      {days.some((d) => d.restricted) && (
        <p className="mt-3 text-xs text-muted-foreground">
          {t("labels.upcoming_days_hint", {
            hours: formatHours(
              days.find((d) => d.restricted)?.hours,
              locale
            ),
          })}
        </p>
      )}
    </div>
  );
}

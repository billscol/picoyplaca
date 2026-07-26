import { CircleCheck, CircleAlert } from "lucide-react";
import type { PlateDigitDaySchedule } from "@/lib/pico-placa";
import type { Translator } from "@/lib/city-seo";
import { formatDigitList, formatHours } from "@/lib/schedule-format";
import { cn } from "@/lib/utils";

export function TodayStatus({
  todayEntry,
  allDay,
  locale,
  t,
}: {
  todayEntry: PlateDigitDaySchedule | null;
  allDay?: boolean;
  locale: string;
  t: Translator;
}) {
  const restricted = todayEntry !== null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3.5",
        restricted ? "border-foreground/10 bg-secondary" : "border-primary/25 bg-primary/10"
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          restricted ? "animate-pulse-ring bg-foreground text-background" : "bg-primary text-primary-foreground"
        )}
      >
        {restricted ? <CircleAlert className="size-4.5" /> : <CircleCheck className="size-4.5" />}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{restricted ? t("today.restricted") : t("today.free")}</p>
        {restricted && todayEntry && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("today.digits_label")}: {formatDigitList(todayEntry.digits, locale)}
            {" · "}
            {allDay ? t("today.all_day") : formatHours(todayEntry.hours, locale)}
          </p>
        )}
      </div>
    </div>
  );
}

import { Hash, Clock } from "lucide-react";
import type { PlateDigitDaySchedule } from "@/lib/pico-placa";
import type { Translator } from "@/lib/city-seo";
import { formatDigitList, formatHours } from "@/lib/schedule-format";
import { RestrictionBanner } from "@/components/marketing/restriction-banner";
import { Badge } from "@/components/ui/badge";

export function TodayStatus({
  todayEntry,
  allDay,
  locale,
  t,
  size = "lg",
}: {
  todayEntry: PlateDigitDaySchedule | null;
  allDay?: boolean;
  locale: string;
  t: Translator;
  size?: "lg" | "md";
}) {
  const restricted = todayEntry !== null;

  return (
    <RestrictionBanner
      status={restricted ? "restricted" : "free"}
      headline={restricted ? t("today.restricted") : t("today.free")}
      size={size}
      meta={
        restricted && todayEntry ? (
          <>
            <Badge variant="outline" className="gap-1 bg-white py-1">
              <Hash className="size-3" />
              {formatDigitList(todayEntry.digits, locale)}
            </Badge>
            <Badge variant="outline" className="gap-1 bg-white py-1">
              <Clock className="size-3" />
              {allDay ? t("today.all_day") : formatHours(todayEntry.hours, locale)}
            </Badge>
          </>
        ) : undefined
      }
    />
  );
}

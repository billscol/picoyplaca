"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CarFront, Hash, Clock } from "lucide-react";
import { extractPlateDigit, type PlateDigitDaySchedule } from "@/lib/pico-placa";
import { dayLabel, formatHours } from "@/lib/schedule-format";
import { RestrictionBanner } from "@/components/marketing/restriction-banner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DIGITS = Array.from({ length: 10 }, (_, d) => d);

export function PlateDigitLookup({
  schedule,
  allDay,
  digitPosition = "last",
  locale,
  plate,
}: {
  schedule: PlateDigitDaySchedule[];
  allDay?: boolean;
  digitPosition?: "first" | "last";
  locale: string;
  /** Plate from a deep link (e.g. `?placa=ABC123`) — preselects the matching digit. */
  plate?: string;
}) {
  const t = useTranslations("city_page");
  const [selected, setSelected] = useState<number | null>(() =>
    plate ? extractPlateDigit(plate, digitPosition) : null
  );
  const matches = selected === null ? [] : schedule.filter((entry) => entry.digits.includes(selected));
  const restricted = selected !== null && matches.length > 0;

  return (
    <div className="rounded-2xl border-2 border-foreground/10 bg-white p-5 shadow-(--shadow-hover)">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-primary">
          <CarFront className="size-4.5" />
        </span>
        <div>
          <h2 className="text-base font-bold">{t("lookup.title")}</h2>
          {plate ? (
            <p className="text-xs font-semibold text-muted-foreground">
              {t("lookup.result_for", { plate: plate.toUpperCase() })}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t(digitPosition === "first" ? "lookup.subtitle_first" : "lookup.subtitle")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10">
        {DIGITS.map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => setSelected(digit)}
            aria-pressed={selected === digit}
            className={cn(
              "flex aspect-square items-center justify-center rounded-xl border text-base font-extrabold transition-all duration-200 active:scale-90",
              selected === digit
                ? "scale-110 border-transparent bg-primary text-primary-foreground shadow-(--shadow-hover)"
                : "border-border bg-secondary text-foreground hover:scale-105 hover:border-foreground/30"
            )}
          >
            {digit}
          </button>
        ))}
      </div>

      <div key={selected ?? "none"} className="animate-in fade-in mt-4 duration-300">
        {selected === null && <p className="text-sm text-muted-foreground">{t("lookup.placeholder")}</p>}

        {selected !== null && !restricted && (
          <RestrictionBanner status="free" headline={t("lookup.free_headline")} size="md" />
        )}

        {restricted && (
          <RestrictionBanner
            status="restricted"
            size="md"
            headline={matches.map((m) => dayLabel(m.day, locale)).join(" · ")}
            meta={
              <>
                <Badge variant="outline" className="gap-1 bg-white py-1">
                  <Hash className="size-3" />
                  {selected}
                </Badge>
                <Badge variant="outline" className="gap-1 bg-white py-1">
                  <Clock className="size-3" />
                  {allDay ? t("today.all_day") : formatHours(matches[0]?.hours, locale)}
                </Badge>
              </>
            }
          />
        )}
      </div>
    </div>
  );
}

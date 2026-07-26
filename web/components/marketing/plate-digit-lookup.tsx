"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CircleCheck, CircleAlert } from "lucide-react";
import type { PlateDigitDaySchedule } from "@/lib/pico-placa";
import { dayLabel, formatHours } from "@/lib/schedule-format";
import { cn } from "@/lib/utils";

const DIGITS = Array.from({ length: 10 }, (_, d) => d);

export function PlateDigitLookup({
  schedule,
  allDay,
  digitPosition = "last",
  locale,
}: {
  schedule: PlateDigitDaySchedule[];
  allDay?: boolean;
  digitPosition?: "first" | "last";
  locale: string;
}) {
  const t = useTranslations("city_page");
  const [selected, setSelected] = useState<number | null>(null);
  const matches = selected === null ? [] : schedule.filter((entry) => entry.digits.includes(selected));
  const restricted = selected !== null && matches.length > 0;

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-(--shadow-subtle)">
      <h3 className="text-base font-semibold">{t("lookup.title")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {t(digitPosition === "first" ? "lookup.subtitle_first" : "lookup.subtitle")}
      </p>

      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10">
        {DIGITS.map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => setSelected(digit)}
            aria-pressed={selected === digit}
            className={cn(
              "flex aspect-square items-center justify-center rounded-full border text-sm font-bold transition-all duration-200 active:scale-90",
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
          <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CircleCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold">{t("lookup.free_headline")}</p>
              <p className="text-xs text-muted-foreground">{t("lookup.digit_label", { digit: selected })}</p>
            </div>
          </div>
        )}

        {restricted && (
          <div className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-secondary px-4 py-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
              <CircleAlert className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold capitalize">
                {matches.map((m) => dayLabel(m.day, locale)).join(" · ")}
              </p>
              <p className="text-xs text-muted-foreground">
                {allDay ? t("today.all_day") : formatHours(matches[0]?.hours, locale)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

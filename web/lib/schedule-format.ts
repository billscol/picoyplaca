import type { HourRange, PlateDigitDaySchedule } from "@/lib/pico-placa";

const DAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/** Jan 4 1970 (UTC) was a Sunday — used as a locale-agnostic reference date per weekday. */
export function dayLabel(day: string, locale: string): string {
  const idx = DAY_INDEX[day.toLowerCase()] ?? 0;
  const date = new Date(Date.UTC(1970, 0, 4 + idx));
  const label = new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDayList(days: string[], locale: string): string {
  const labels = days.map((d) => dayLabel(d, locale).toLowerCase());
  return new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(labels);
}

export function formatDigitList(digits: number[], locale: string): string {
  return new Intl.ListFormat(locale, { style: "long", type: "disjunction" }).format(digits.map(String));
}

function formatHourRange(hours: HourRange): string {
  return `${hours.start}–${hours.end}`;
}

export function formatHours(hours: HourRange | HourRange[] | undefined, locale: string): string {
  if (!hours) return "";
  const ranges = Array.isArray(hours) ? hours : [hours];
  return new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(ranges.map(formatHourRange));
}

export function toHourRangeArray(hours: HourRange | HourRange[]): HourRange[] {
  return Array.isArray(hours) ? hours : [hours];
}

/** Weekday key ("monday".."sunday") for `now` in the given IANA timezone — independent of UI locale. */
export function getTodayDayName(timezone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "long" }).format(now).toLowerCase();
}

export function getTodayDateLabel(timezone: string, locale: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat(locale, { timeZone: timezone, dateStyle: "full" }).format(now);
}

/** Returns today's schedule entry for this category, or null if there's no restriction today. */
export function getTodayRestriction(
  schedule: PlateDigitDaySchedule[],
  timezone: string,
  now: Date = new Date()
): PlateDigitDaySchedule | null {
  const today = getTodayDayName(timezone, now);
  return schedule.find((entry) => entry.day.toLowerCase() === today) ?? null;
}

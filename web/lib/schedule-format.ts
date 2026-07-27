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

/** Abbreviated weekday label ("Lun", "Mar"...) for compact day strips. */
export function shortDayLabel(day: string, locale: string): string {
  const idx = DAY_INDEX[day.toLowerCase()] ?? 0;
  const date = new Date(Date.UTC(1970, 0, 4 + idx));
  const label = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(date).replace(/\.$/, "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const WEEK_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export interface WeekStripDay {
  day: string;
  digits: number[];
  hours?: HourRange | HourRange[];
  restricted: boolean;
}

/** Maps a category's schedule onto a fixed Mon-Sun grid for a compact 7-cell week strip. */
export function buildWeekStrip(schedule: PlateDigitDaySchedule[]): WeekStripDay[] {
  return WEEK_ORDER.map((day) => {
    const entry = schedule.find((e) => e.day.toLowerCase() === day);
    return { day, digits: entry?.digits ?? [], hours: entry?.hours, restricted: Boolean(entry) };
  });
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

export interface UpcomingDay {
  date: Date;
  day: string;
  digits: number[];
  hours?: HourRange | HourRange[];
  restricted: boolean;
}

/**
 * Next `count` calendar days (including today) with real dates, mapped against a
 * plate_digit_day schedule — for a literal date-based mini-calendar rather than an
 * abstract "restricted on Mondays" statement.
 */
export function buildUpcomingDays(
  schedule: PlateDigitDaySchedule[],
  timezone: string,
  count = 7,
  now: Date = new Date()
): UpcomingDay[] {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, part) => ({ ...acc, [part.type]: part.value }), {});
  const anchor = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));

  return Array.from({ length: count }, (_, i) => {
    const date = new Date(anchor + i * 86_400_000);
    const day = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(date).toLowerCase();
    const entry = schedule.find((e) => e.day.toLowerCase() === day);
    return { date, day, digits: entry?.digits ?? [], hours: entry?.hours, restricted: Boolean(entry) };
  });
}

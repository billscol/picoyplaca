import type {
  City,
  CongestionChargePayload,
  EmissionLabelZonePayload,
  PlateCategory,
  PlateDigitDayPayload,
  Rule,
  RulePayload,
} from "@/lib/pico-placa";
import { findParticularesCategory } from "@/lib/pico-placa";
import { dayLabel, formatDayList, formatDigitList, formatHours } from "@/lib/schedule-format";

const EMPTY_CATEGORY: PlateCategory = { key: "particulares", schedule: [] };

export type Translator = (key: string, values?: Record<string, string | number>) => string;

export interface Faq {
  question: string;
  answer: string;
}

export interface CitySeo {
  title: string;
  description: string;
  intro: string;
  faqs: Faq[];
}

interface RestrictionStrategy {
  intro(t: Translator, city: City, payload: RulePayload, locale: string): string;
  faqs(t: Translator, city: City, payload: RulePayload, locale: string): Faq[];
  meta(t: Translator, city: City, payload: RulePayload): { title: string; description: string };
}

function formatExceptions(t: Translator, exceptions: string[] | undefined, locale: string): string {
  if (!exceptions || exceptions.length === 0) return "";
  const labels = exceptions.map((code) => {
    const key = `exceptions.${code}`;
    const label = t(key);
    return label === key ? code.replace(/_/g, " ") : label;
  });
  return new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(labels);
}

const plateDigitDayStrategy: RestrictionStrategy = {
  meta(t, city, payload) {
    const p = findParticularesCategory(payload as PlateDigitDayPayload) ?? EMPTY_CATEGORY;
    const active = p.schedule.length > 0;
    return {
      title: t(active ? "meta.title_active" : "meta.title_none", { city: city.city_name }),
      description: t(active ? "meta.description_active" : "meta.description_none", { city: city.city_name }),
    };
  },

  intro(t, city, payload, locale) {
    const p = findParticularesCategory(payload as PlateDigitDayPayload) ?? EMPTY_CATEGORY;
    if (p.schedule.length === 0) {
      return t("plate_digit_day.intro_none", {
        city: city.city_name,
        note: t("plate_digit_day.none_note"),
      });
    }
    const days = formatDayList(p.schedule.map((s) => s.day), locale);
    const digitsToday = formatDigitList(p.schedule[0].digits, locale);
    const hours = formatHours(p.schedule[0].hours, locale);
    return t("plate_digit_day.intro_active", { city: city.city_name, digitsToday, days, hours });
  },

  faqs(t, city, payload, locale) {
    const p = findParticularesCategory(payload as PlateDigitDayPayload) ?? EMPTY_CATEGORY;

    if (p.schedule.length === 0) {
      return [
        {
          question: t("plate_digit_day.faq_none_question", { city: city.city_name }),
          answer: t("plate_digit_day.faq_none_answer", { note: t("plate_digit_day.none_note") }),
        },
      ];
    }

    const faqs: Faq[] = [];

    for (const entry of p.schedule.slice(0, 3)) {
      const digit = formatDigitList(entry.digits, locale);
      const days = dayLabel(entry.day, locale).toLowerCase();
      const hours = formatHours(entry.hours, locale);
      faqs.push({
        question: t("plate_digit_day.faq_digit_question", { city: city.city_name, digit }),
        answer: t("plate_digit_day.faq_digit_answer", { city: city.city_name, digit, days, hours }),
      });
    }

    const allDays = formatDayList(p.schedule.map((s) => s.day), locale);
    const mainHours = formatHours(p.schedule[0].hours, locale);
    faqs.push({
      question: t("plate_digit_day.faq_hours_question", { city: city.city_name }),
      answer: t("plate_digit_day.faq_hours_answer", { city: city.city_name, days: allDays, hours: mainHours }),
    });

    const exceptions = formatExceptions(t, p.exceptions, locale);
    faqs.push({
      question: t("plate_digit_day.faq_exceptions_question", { city: city.city_name }),
      answer: exceptions
        ? t("plate_digit_day.faq_exceptions_answer", { exceptions })
        : t("plate_digit_day.faq_exceptions_answer_none", { city: city.city_name }),
    });

    faqs.push({
      question: t("plate_digit_day.faq_holidays_question", { city: city.city_name }),
      answer: p.holidays_suspended
        ? t("plate_digit_day.faq_holidays_answer_suspended", { city: city.city_name })
        : t("plate_digit_day.faq_holidays_answer_active", { city: city.city_name }),
    });

    return faqs;
  },
};

const emissionLabelZoneStrategy: RestrictionStrategy = {
  meta(t, city, payload) {
    const p = payload as EmissionLabelZonePayload;
    return {
      title: t("emission_label_zone.meta_title", { city: city.city_name, zoneName: p.zone_name }),
      description: t("emission_label_zone.meta_description", { city: city.city_name, zoneName: p.zone_name }),
    };
  },

  intro(t, city, payload, locale) {
    const p = payload as EmissionLabelZonePayload;
    return t("emission_label_zone.intro", {
      city: city.city_name,
      zoneName: p.zone_name,
      restrictedLabels: p.restricted_labels.join(", "),
      hours: formatHours(p.hours, locale),
    });
  },

  faqs(t, city, payload, locale) {
    const p = payload as EmissionLabelZonePayload;
    return [
      {
        question: t("emission_label_zone.faq_labels_question", { city: city.city_name, zoneName: p.zone_name }),
        answer: t("emission_label_zone.faq_labels_answer", {
          restrictedLabels: p.restricted_labels.join(", "),
          allowedLabels: (p.allowed_labels ?? []).join(", "),
        }),
      },
      {
        question: t("emission_label_zone.faq_hours_question", { zoneName: p.zone_name }),
        answer: t("emission_label_zone.faq_hours_answer", { hours: formatHours(p.hours, locale) }),
      },
    ];
  },
};

const congestionChargeStrategy: RestrictionStrategy = {
  meta(t, city, payload) {
    const p = payload as CongestionChargePayload;
    return {
      title: t("congestion_charge.meta_title", { city: city.city_name, zoneName: p.zone_name }),
      description: t("congestion_charge.meta_description", { city: city.city_name, zoneName: p.zone_name }),
    };
  },

  intro(t, city, payload, locale) {
    const p = payload as CongestionChargePayload;
    return t("congestion_charge.intro", {
      city: city.city_name,
      zoneName: p.zone_name,
      fee: new Intl.NumberFormat(locale, { style: "currency", currency: p.currency }).format(p.fee),
      hours: formatHours(p.hours, locale),
    });
  },

  faqs(t, city, payload, locale) {
    const p = payload as CongestionChargePayload;
    return [
      {
        question: t("congestion_charge.faq_fee_question", { city: city.city_name }),
        answer: t("congestion_charge.faq_fee_answer", {
          city: city.city_name,
          zoneName: p.zone_name,
          fee: new Intl.NumberFormat(locale, { style: "currency", currency: p.currency }).format(p.fee),
          hours: formatHours(p.hours, locale),
        }),
      },
    ];
  },
};

const strategies: Record<City["restriction_model"], RestrictionStrategy> = {
  plate_digit_day: plateDigitDayStrategy,
  emission_label_zone: emissionLabelZoneStrategy,
  congestion_charge: congestionChargeStrategy,
};

function formatLongDate(value: string | undefined, locale: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date);
}

export function buildCitySeo(
  data: { city: City; rule: Rule },
  locale: string,
  t: Translator
): CitySeo {
  const { city, rule } = data;
  const strategy = strategies[city.restriction_model];
  const { title, description } = strategy.meta(t, city, rule.payload);

  const faqs = [
    ...strategy.faqs(t, city, rule.payload, locale),
    { question: t("vehicle_scope.question"), answer: t("vehicle_scope.answer", { city: city.city_name }) },
  ];

  const effectiveFrom = formatLongDate(rule.effective_from, locale);
  if (effectiveFrom) {
    faqs.push({
      question: t("freshness.question"),
      answer: t("freshness.answer", { city: city.city_name, date: effectiveFrom }),
    });
  }

  if (city.legal_info?.fine_value) {
    faqs.push({
      question: t("legal_faq.question", { city: city.city_name }),
      answer: city.legal_info.consequence
        ? t("legal_faq.answer_with_consequence", {
            city: city.city_name,
            fine: city.legal_info.fine_value,
            consequence: city.legal_info.consequence,
          })
        : t("legal_faq.answer", { city: city.city_name, fine: city.legal_info.fine_value }),
    });
  }

  return {
    title,
    description,
    intro: strategy.intro(t, city, rule.payload, locale),
    faqs,
  };
}

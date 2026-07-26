export type RestrictionModel = "plate_digit_day" | "emission_label_zone" | "congestion_charge";

export interface ContactChannels {
  twitter_url?: string;
  facebook_url?: string;
  website_url?: string;
  email?: string;
}

export interface City {
  slug: string;
  city_name: string;
  country_name: string;
  country_code?: string;
  region?: string | null;
  restriction_model: RestrictionModel;
  timezone?: string;
  contact_channels?: ContactChannels | null;
}

export interface HourRange {
  start: string;
  end: string;
}

export interface PlateDigitDaySchedule {
  day: string;
  digits: number[];
  hours?: HourRange | HourRange[];
}

export type CategoryKey =
  | "particulares"
  | "motos"
  | "taxis"
  | "transporte_publico_colectivo"
  | "transporte_carga"
  | "transporte_especial"
  | "regional";

export interface PlateCategorySubRule {
  label: string;
  detail: string;
}

export interface PlateCategory {
  key: CategoryKey;
  schedule: PlateDigitDaySchedule[];
  exceptions?: string[];
  holidays_suspended?: boolean;
  all_day?: boolean;
  digit_position?: "first" | "last";
  /** Resumen corto (una linea), siempre visible, para categorias sin schedule. */
  note_short?: string;
  /** Explicacion larga — se muestra colapsada/expandible, no de entrada. */
  note?: string;
  /** Para categorias con varias reglas distintas (ej. carga por edad/peso) en vez de un solo note. */
  sub_rules?: PlateCategorySubRule[];
}

export interface PlateDigitDayPayload {
  categories: PlateCategory[];
  metro_area?: { name: string; member_slugs: string[] } | null;
}

export interface EmissionLabelZonePayload {
  zone_name: string;
  restricted_labels: string[];
  allowed_labels?: string[];
  hours: HourRange;
  exempt_days?: string[];
}

export interface CongestionChargePayload {
  zone_name: string;
  fee_usd: number;
  hours: HourRange;
  exempt_days?: string[];
}

export type RulePayload = PlateDigitDayPayload | EmissionLabelZonePayload | CongestionChargePayload;

export interface Rule {
  payload: RulePayload;
  effective_from: string;
  effective_to?: string | null;
  source_url?: string | null;
  last_verified?: string;
}

export interface CityRuleResponse {
  city: City;
  rule: Rule;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function getCities(): Promise<City[]> {
  const res = await fetch(`${API_BASE}/pico-placa/cities`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

export function findParticularesCategory(payload: PlateDigitDayPayload): PlateCategory | undefined {
  return payload.categories.find((c) => c.key === "particulares") ?? payload.categories[0];
}

export async function getCityRule(slug: string): Promise<CityRuleResponse | null> {
  const res = await fetch(`${API_BASE}/pico-placa/rules/${slug}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
}

import type {
  City,
  CongestionChargePayload,
  EmissionLabelZonePayload,
  PlateDigitDayPayload,
  RulePayload,
} from "@/lib/pico-placa";
import type { Translator } from "@/lib/city-seo";
import { PlateZoneSchedule } from "@/components/marketing/plate-zone-schedule";
import { EmissionZoneCard } from "@/components/marketing/emission-zone-card";
import { CongestionChargeCard } from "@/components/marketing/congestion-charge-card";

export function RestrictionSchedule({
  model,
  payload,
  timezone,
  locale,
  t,
}: {
  model: City["restriction_model"];
  payload: RulePayload;
  timezone: string;
  locale: string;
  t: Translator;
}) {
  switch (model) {
    case "plate_digit_day":
      return (
        <PlateZoneSchedule payload={payload as PlateDigitDayPayload} timezone={timezone} locale={locale} t={t} />
      );
    case "emission_label_zone":
      return <EmissionZoneCard payload={payload as EmissionLabelZonePayload} locale={locale} t={t} />;
    case "congestion_charge":
      return <CongestionChargeCard payload={payload as CongestionChargePayload} locale={locale} />;
  }
}

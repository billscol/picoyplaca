import { renderOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";
import { getCityRule } from "@/lib/pico-placa";

export const size = ogImageSize;
export const contentType = ogImageContentType;

const modelLabel: Record<string, Record<string, string>> = {
  es: {
    plate_digit_day: "Pico y placa",
    emission_label_zone: "Zona de bajas emisiones",
    congestion_charge: "Peaje de congestión",
  },
  en: {
    plate_digit_day: "License plate restriction",
    emission_label_zone: "Low emission zone",
    congestion_charge: "Congestion charge",
  },
};

const subtitleCopy: Record<string, string> = {
  es: "Horarios, excepciones y estado actualizado de la restricción.",
  en: "Schedule, exceptions and up-to-date restriction status.",
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const data = await getCityRule(slug);
  const labels = modelLabel[locale] ?? modelLabel.es;
  const subtitle = subtitleCopy[locale] ?? subtitleCopy.es;

  if (!data) {
    return renderOgImage({ eyebrow: "Pico y Placa", title: slug, subtitle });
  }

  const { city } = data;
  return renderOgImage({
    eyebrow: labels[city.restriction_model],
    title: `${city.city_name}, ${city.country_name}`,
    subtitle,
  });
}

import { renderOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "Pico y Placa Global";

const copy: Record<string, { eyebrow: string; title: string; subtitle: string }> = {
  es: {
    eyebrow: "Consulta gratuita",
    title: "Pico y placa, zonas de bajas emisiones y peajes de congestión",
    subtitle: "Restricciones vehiculares al día en LatAm, USA y España.",
  },
  en: {
    eyebrow: "Free lookup",
    title: "Vehicle restrictions, low emission zones and congestion charges",
    subtitle: "Up-to-date circulation rules across LatAm, USA and Spain.",
  },
};

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return renderOgImage(copy[locale] ?? copy.es);
}

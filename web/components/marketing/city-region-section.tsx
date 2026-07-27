import { MapPin, ArrowRight } from "lucide-react";
import type { City } from "@/lib/pico-placa";
import type { Translator } from "@/lib/city-seo";
import { Link } from "@/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { slugifyCountry } from "@/lib/country-slug";

const MIN_CITIES_FOR_HUB = 2;

export function CityRegionSection({
  city,
  allCities,
  t,
}: {
  city: City;
  allCities: City[];
  t: Translator;
}) {
  if (!city.region) return null;

  // Regions are typically unique per city (department/province), so same-region siblings
  // are rare — fall back to same-country cities so this section isn't silently empty.
  const regionSiblings = allCities.filter((c) => c.slug !== city.slug && c.region === city.region);
  const countryMates = allCities.filter((c) => c.slug !== city.slug && c.country_name === city.country_name);
  const siblings = regionSiblings.length > 0 ? regionSiblings : countryMates;
  const hasCountryHub = countryMates.length + 1 >= MIN_CITIES_FOR_HUB;

  return (
    <Card className="card-hover-lift animate-in fade-in slide-in-from-bottom-4 border-2 border-foreground/8 duration-500">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-foreground">
            <MapPin className="size-5" />
          </span>
          <CardTitle className="text-base font-bold">{t("region.title")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          {city.region} · {city.country_name}
        </p>
        {siblings.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">{t("region.siblings_title")}</p>
            <div className="flex flex-wrap gap-2">
              {siblings.map((sibling) => (
                <Link
                  key={sibling.slug}
                  href={{ pathname: "/ciudades/[slug]", params: { slug: sibling.slug } }}
                  className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-foreground/30 hover:bg-primary/15"
                >
                  {sibling.city_name}
                </Link>
              ))}
            </div>
          </div>
        )}
        {hasCountryHub && (
          <Link
            href={{ pathname: "/ciudades/pais/[country]", params: { country: slugifyCountry(city.country_name) } }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:underline"
          >
            {t("region.see_country_hub", { country: city.country_name })}
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

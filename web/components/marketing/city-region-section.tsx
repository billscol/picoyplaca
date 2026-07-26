import { MapPin } from "lucide-react";
import type { City } from "@/lib/pico-placa";
import type { Translator } from "@/lib/city-seo";
import { Link } from "@/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const siblings = allCities.filter((c) => c.slug !== city.slug && c.region === city.region);

  return (
    <Card className="card-hover-lift animate-in fade-in slide-in-from-bottom-4 border-border duration-500">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <MapPin className="size-4" />
          </span>
          <CardTitle>{t("region.title")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t("region.body", { city: city.city_name, region: city.region, country: city.country_name })}
        </p>
        {siblings.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">{t("region.siblings_title")}</p>
            <div className="flex flex-wrap gap-2">
              {siblings.map((sibling) => (
                <Link
                  key={sibling.slug}
                  href={{ pathname: "/ciudades/[slug]", params: { slug: sibling.slug } }}
                  className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                >
                  {sibling.city_name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MODEL_ICON, MODEL_CHIP_CLASS } from "@/lib/model-visuals";
import type { City, RestrictionModel } from "@/lib/pico-placa";

export function CityFilterGrid({
  cities,
  modelLabels,
  filterAllLabel,
  apiErrorLabel,
}: {
  cities: City[];
  modelLabels: Record<RestrictionModel, string>;
  filterAllLabel: string;
  apiErrorLabel: string;
}) {
  const [filter, setFilter] = useState<RestrictionModel | "all">("all");
  const models = Object.keys(modelLabels) as RestrictionModel[];
  const filtered = filter === "all" ? cities : cities.filter((c) => c.restriction_model === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(["all", ...models] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95",
              filter === value
                ? "border-transparent bg-foreground text-background shadow-(--shadow-hover)"
                : "border-border bg-secondary text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            )}
          >
            {value === "all" ? filterAllLabel : modelLabels[value]}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((city, i) => {
          const Icon = MODEL_ICON[city.restriction_model];
          return (
            <Link
              key={city.slug}
              href={{ pathname: "/ciudades/[slug]", params: { slug: city.slug } }}
              className="group animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500"
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <Card className="card-hover-lift h-full border-border p-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <span
                      className={cn(
                        "flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                        MODEL_CHIP_CLASS[city.restriction_model]
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </div>
                  <CardTitle className="mt-3 text-base">{city.city_name}</CardTitle>
                  <CardDescription>{city.country_name}</CardDescription>
                  <Badge variant="secondary" className="mt-2 w-fit">
                    {modelLabels[city.restriction_model]}
                  </Badge>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
        {filtered.length === 0 && cities.length === 0 && (
          <p className="text-sm text-muted-foreground">{apiErrorLabel}</p>
        )}
      </div>
    </div>
  );
}

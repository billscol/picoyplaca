"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, MapPin } from "lucide-react";
import { useRouter } from "@/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { City, CategoryKey } from "@/lib/pico-placa";

const CATEGORY_KEYS: CategoryKey[] = [
  "particulares",
  "motos",
  "taxis",
  "transporte_publico_colectivo",
  "transporte_carga",
  "transporte_especial",
  "regional",
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function PicoPlacaFinder({ cities }: { cities: City[] }) {
  const t = useTranslations("finder");
  const tCategories = useTranslations("city_page");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [category, setCategory] = useState<CategoryKey>("particulares");
  const [plate, setPlate] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Best-effort city auto-fill from IP geolocation — silently ignored if it fails or is blocked.
  useEffect(() => {
    if (cities.length === 0) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    fetch("https://ipapi.co/json/", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { city?: string } | null) => {
        if (!data?.city) return;
        const match = cities.find((c) => normalize(c.city_name) === normalize(data.city!));
        if (match) {
          setSelectedCity(match);
          setQuery(match.city_name);
          setAutoFilled(true);
        }
      })
      .catch(() => {})
      .finally(() => clearTimeout(timeout));

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities.length]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions =
    query.trim().length === 0
      ? cities.slice(0, 6)
      : cities.filter((c) => normalize(c.city_name).includes(normalize(query)) || normalize(c.country_name).includes(normalize(query))).slice(0, 6);

  function selectCity(city: City) {
    setSelectedCity(city);
    setQuery(city.city_name);
    setAutoFilled(false);
    setShowSuggestions(false);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setAutoFilled(false);
    setShowSuggestions(true);
    if (selectedCity && normalize(value) !== normalize(selectedCity.city_name)) {
      setSelectedCity(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCity) return;

    const searchQuery: Record<string, string> = {};
    if (selectedCity.restriction_model === "plate_digit_day" && plate.trim()) {
      searchQuery.placa = plate.trim().toUpperCase();
      searchQuery.categoria = category;
    }

    router.push({
      pathname: "/ciudades/[slug]",
      params: { slug: selectedCity.slug },
      query: Object.keys(searchQuery).length > 0 ? searchQuery : undefined,
    });
  }

  const showVehicleFields = selectedCity?.restriction_model === "plate_digit_day";

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both w-full max-w-2xl rounded-2xl border-2 border-foreground/10 bg-white p-4 text-left shadow-(--shadow-hover) duration-700 delay-150 sm:p-5"
    >
      <div className="grid gap-3 sm:grid-cols-[1.3fr_1fr_1fr] sm:items-end">
        <div ref={containerRef} className="relative">
          <label className="text-xs font-bold text-muted-foreground">{t("city_label")}</label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute top-1/2 left-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-lg bg-foreground text-primary">
              <MapPin className="size-3.5" />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder={t("city_placeholder")}
              className="w-full rounded-xl border-2 border-border bg-secondary/40 py-2.5 pr-3 pl-10 text-sm font-medium outline-none transition-colors focus:border-foreground/30 focus:bg-white"
              autoComplete="off"
            />
          </div>
          {autoFilled && <p className="mt-1 text-xs text-muted-foreground">{t("city_editable_hint")}</p>}

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-xl border-2 border-foreground/10 bg-white shadow-(--shadow-hover)">
              {suggestions.map((city) => (
                <li key={city.slug}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectCity(city)}
                    className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-secondary"
                  >
                    <span className="font-semibold">{city.city_name}</span>
                    <span className="text-xs text-muted-foreground">{city.country_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {query.trim().length > 0 && !selectedCity && suggestions.length === 0 && (
            <p className="mt-1 text-xs text-muted-foreground">{t("city_empty")}</p>
          )}
        </div>

        {showVehicleFields ? (
          <>
            <div>
              <label className="text-xs font-bold text-muted-foreground">{t("category_label")}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryKey)}
                className="mt-1.5 w-full rounded-xl border-2 border-border bg-secondary/40 px-3 py-2.5 text-sm font-medium outline-none transition-colors focus:border-foreground/30 focus:bg-white"
              >
                {CATEGORY_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {tCategories(`categories.${key}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">{t("plate_label")}</label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder={t("plate_placeholder")}
                maxLength={8}
                className="mt-1.5 w-full rounded-xl border-2 border-border bg-secondary/40 px-3 py-2.5 text-sm font-bold uppercase outline-none transition-colors focus:border-foreground/30 focus:bg-white"
              />
            </div>
          </>
        ) : (
          selectedCity && (
            <p className="text-xs text-muted-foreground sm:col-span-2">{t("other_model_hint")}</p>
          )
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={!selectedCity}
        className={cn(
          "mt-3 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/85 sm:w-auto",
          !selectedCity && "pointer-events-none opacity-50"
        )}
      >
        <Search className="size-4" />
        {t("submit")}
      </Button>
    </form>
  );
}

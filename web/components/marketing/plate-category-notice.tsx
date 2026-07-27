import { ChevronDown } from "lucide-react";
import type { PlateCategory } from "@/lib/pico-placa";
import type { Translator } from "@/lib/city-seo";
import { RestrictionBanner } from "@/components/marketing/restriction-banner";

/** Shown when a search links to a category with no fixed daily digit (e.g. taxis rotating monthly). */
export function PlateCategoryNotice({
  category,
  plate,
  t,
}: {
  category: PlateCategory;
  plate: string;
  t: Translator;
}) {
  const categoryLabel = t(`categories.${category.key}`);
  const hasDetail = Boolean(category.note && category.note !== category.note_short);

  return (
    <div className="rounded-2xl border-2 border-foreground/10 bg-white p-5 shadow-(--shadow-hover)">
      <RestrictionBanner
        status="info"
        headline={t("rotating_notice.title", { category: categoryLabel, plate: plate.toUpperCase() })}
        subline={t("rotating_notice.body")}
      />

      {category.sub_rules && category.sub_rules.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {category.sub_rules.map((rule, i) => (
            <li key={i} className="rounded-xl border border-border bg-secondary/50 px-3.5 py-3">
              <p className="text-sm font-bold">{rule.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{rule.detail}</p>
            </li>
          ))}
        </ul>
      ) : (
        <>
          {category.note_short && <p className="mt-4 text-sm font-semibold">{category.note_short}</p>}
          {hasDetail && (
            <details className="group mt-2">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-semibold text-foreground hover:underline [&::-webkit-details-marker]:hidden">
                {t("labels.see_detail")}
                <ChevronDown className="size-3.5 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{category.note}</p>
            </details>
          )}
        </>
      )}
    </div>
  );
}

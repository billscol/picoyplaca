import { Leaf, Clock, ChevronDown } from "lucide-react";
import type { EmissionLabelZonePayload } from "@/lib/pico-placa";
import type { Translator } from "@/lib/city-seo";
import { formatHours } from "@/lib/schedule-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function EmissionZoneCard({
  payload,
  locale,
  t,
}: {
  payload: EmissionLabelZonePayload;
  locale: string;
  t: Translator;
}) {
  return (
    <Card className="card-hover-lift animate-in fade-in slide-in-from-bottom-4 border-2 border-foreground/8 shadow-(--shadow-subtle) duration-500">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-vermillion/12 text-vermillion">
            <Leaf className="size-5.5" />
          </span>
          <CardTitle as="h3" className="text-base font-bold">{payload.zone_name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">{t("labels.exceptions_title")}</p>
          <div className="flex flex-wrap gap-1.5">
            {payload.restricted_labels.map((label) => (
              <Badge key={label} className="bg-foreground text-background">
                {label}
              </Badge>
            ))}
            {(payload.allowed_labels ?? []).map((label) => (
              <Badge key={label} className="bg-primary text-primary-foreground">
                {label}
              </Badge>
            ))}
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground">
          <Clock className="size-3.5" />
          {formatHours(payload.hours, locale)}
        </span>

        {payload.note && (
          <details className="group">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-semibold text-foreground hover:underline [&::-webkit-details-marker]:hidden">
              {t("labels.see_detail")}
              <ChevronDown className="size-3.5 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{payload.note}</p>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

import { Leaf } from "lucide-react";
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
    <Card className="card-hover-lift animate-in fade-in slide-in-from-bottom-4 border-border shadow-(--shadow-subtle) duration-500">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-vermillion/10 text-vermillion">
            <Leaf className="size-4" />
          </span>
          <CardTitle>{payload.zone_name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">{t("labels.exceptions_title")}</p>
          <div className="flex flex-wrap gap-1.5">
            {payload.restricted_labels.map((label) => (
              <Badge key={label} className="bg-primary text-primary-foreground">
                {label}
              </Badge>
            ))}
            {(payload.allowed_labels ?? []).map((label) => (
              <Badge key={label} variant="secondary">
                {label}
              </Badge>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{formatHours(payload.hours, locale)}</p>
      </CardContent>
    </Card>
  );
}

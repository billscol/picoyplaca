import { Coins, Clock, ChevronDown } from "lucide-react";
import type { CongestionChargePayload } from "@/lib/pico-placa";
import type { Translator } from "@/lib/city-seo";
import { formatHours } from "@/lib/schedule-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CongestionChargeCard({
  payload,
  locale,
  t,
}: {
  payload: CongestionChargePayload;
  locale: string;
  t: Translator;
}) {
  const fee = new Intl.NumberFormat(locale, { style: "currency", currency: payload.currency }).format(payload.fee);

  return (
    <Card className="card-hover-lift animate-in fade-in slide-in-from-bottom-4 border-2 border-foreground/8 shadow-(--shadow-subtle) duration-500">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-magenta-pop/12 text-magenta-pop">
            <Coins className="size-5.5" />
          </span>
          <CardTitle as="h3" className="text-base font-bold">{payload.zone_name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-3xl font-extrabold tracking-tight">{fee}</p>
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

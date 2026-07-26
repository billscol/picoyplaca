import { Coins } from "lucide-react";
import type { CongestionChargePayload } from "@/lib/pico-placa";
import { formatHours } from "@/lib/schedule-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CongestionChargeCard({ payload, locale }: { payload: CongestionChargePayload; locale: string }) {
  const fee = new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).format(payload.fee_usd);

  return (
    <Card className="card-hover-lift animate-in fade-in slide-in-from-bottom-4 border-border shadow-(--shadow-subtle) duration-500">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-magenta-pop/10 text-magenta-pop">
            <Coins className="size-4" />
          </span>
          <CardTitle>{payload.zone_name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold tracking-tight">{fee}</p>
        <p className="text-sm text-muted-foreground">{formatHours(payload.hours, locale)}</p>
      </CardContent>
    </Card>
  );
}

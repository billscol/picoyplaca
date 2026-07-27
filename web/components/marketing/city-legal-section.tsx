import { Gavel, BanknoteX, Lock } from "lucide-react";
import type { LegalInfo } from "@/lib/pico-placa";
import type { Translator } from "@/lib/city-seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Se oculta si la ciudad no tiene legal_info investigado todavia — ver migracion 005_legal_info.sql. */
export function CityLegalSection({ legalInfo, t }: { legalInfo: LegalInfo; t: Translator }) {
  return (
    <Card className="card-hover-lift animate-in fade-in slide-in-from-bottom-4 border-2 border-foreground/8 duration-500">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-primary">
            <Gavel className="size-5" />
          </span>
          <CardTitle className="text-base font-bold">{t("legal.title")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {legalInfo.fine_value && (
            <div className="rounded-xl bg-secondary px-4 py-3.5">
              <BanknoteX className="size-5 text-foreground" />
              <p className="mt-2 text-2xl font-extrabold tracking-tight">{legalInfo.fine_value}</p>
              <p className="text-xs font-medium text-muted-foreground">{t("legal.fine_label")}</p>
            </div>
          )}
          {legalInfo.consequence && (
            <div className="rounded-xl bg-secondary px-4 py-3.5">
              <Lock className="size-5 text-foreground" />
              <p className="mt-2 text-sm font-bold leading-tight">{legalInfo.consequence}</p>
            </div>
          )}
        </div>
        {legalInfo.citation && <p className="text-xs text-muted-foreground">{legalInfo.citation}</p>}
      </CardContent>
    </Card>
  );
}

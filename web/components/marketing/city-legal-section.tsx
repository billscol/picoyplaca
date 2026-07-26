import { Gavel, BanknoteX, Lock } from "lucide-react";
import type { Translator } from "@/lib/city-seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CityLegalSection({ t }: { t: Translator }) {
  return (
    <Card className="card-hover-lift animate-in fade-in slide-in-from-bottom-4 border-border duration-500">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <Gavel className="size-4" />
          </span>
          <CardTitle>{t("legal.title")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-secondary/50 px-4 py-3">
            <BanknoteX className="size-5 text-foreground" />
            <p className="mt-2 text-xl font-bold tracking-tight">{t("legal.fine_value")}</p>
            <p className="text-xs text-muted-foreground">{t("legal.fine_label")}</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/50 px-4 py-3">
            <Lock className="size-5 text-foreground" />
            <p className="mt-2 text-sm font-bold leading-tight">{t("legal.consequence")}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{t("legal.citation")}</p>
      </CardContent>
    </Card>
  );
}

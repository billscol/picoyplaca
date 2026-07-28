"use client";

import { useState } from "react";
import { Code2, Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmbedWidgetSnippet({
  slug,
  locale,
  cityName,
}: {
  slug: string;
  locale: string;
  cityName: string;
}) {
  const t = useTranslations("widget");
  const [copied, setCopied] = useState(false);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const widgetPath = locale === "en" ? `/en/widget/${slug}` : `/widget/${slug}`;
  const snippet = `<iframe src="${siteUrl}${widgetPath}" width="280" height="120" style="border:0;border-radius:16px" loading="lazy" title="${cityName} — Pico y Placa"></iframe>`;

  return (
    <Card className="card-hover-lift mt-4 border-2 border-foreground/8 p-2">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
            <Code2 className="size-5" />
          </span>
          <CardTitle className="text-base font-bold">{t("embed_title")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{t("embed_hint", { city: cityName })}</p>
        <div className="flex items-start gap-2">
          <code className="flex-1 overflow-x-auto rounded-xl bg-secondary px-3.5 py-2.5 text-xs text-foreground">
            {snippet}
          </code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(snippet);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-2 text-xs font-semibold transition-colors hover:border-foreground/30 hover:bg-secondary"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {t("embed_copy")}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

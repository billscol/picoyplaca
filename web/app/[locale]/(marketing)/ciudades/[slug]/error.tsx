"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";

export default function CityError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  const t = useTranslations("error_boundary");

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-foreground">
        <AlertTriangle className="size-6.5" />
      </span>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
      <p className="text-muted-foreground">{t("body")}</p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/85"
          onClick={() => unstable_retry()}
        >
          <RotateCw className="size-3.5" data-icon="inline-start" />
          {t("retry")}
        </Button>
        <Button variant="outline" className="rounded-full px-6" render={<Link href="/" />} nativeButton={false}>
          {t("cta_home")}
        </Button>
      </div>
    </section>
  );
}

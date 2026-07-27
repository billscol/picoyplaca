import { getTranslations } from "next-intl/server";
import { MapPinned, ArrowLeft } from "lucide-react";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";

export default async function CityNotFound() {
  const t = await getTranslations("city_not_found");

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-foreground">
        <MapPinned className="size-6.5" />
      </span>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
      <p className="text-muted-foreground">{t("body")}</p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/85"
          render={<Link href="/ciudades" />}
          nativeButton={false}
        >
          {t("cta_cities")}
        </Button>
        <Button variant="outline" className="rounded-full px-6" render={<Link href="/" />} nativeButton={false}>
          <ArrowLeft className="size-3.5" data-icon="inline-start" />
          {t("cta_home")}
        </Button>
      </div>
    </section>
  );
}

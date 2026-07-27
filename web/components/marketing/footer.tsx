import { Zap, MapPinned, Tag, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="mt-auto border-t border-border bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex max-w-sm items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-primary">
              <Zap className="size-4.5" fill="currentColor" strokeWidth={0} />
            </span>
            <div>
              <p className="font-bold tracking-tight">Pico y Placa</p>
              <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/ciudades"
              className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <MapPinned className="size-3.5" />
              {tNav("cities")}
            </Link>
            <Link
              href="/precios"
              className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Tag className="size-3.5" />
              {tNav("pricing")}
            </Link>
            <a
              href={process.env.NEXT_PUBLIC_DOCS_URL ?? "http://localhost:3012/docs"}
              className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <BookOpen className="size-3.5" />
              {tNav("docs")}
            </a>
          </nav>
        </div>
        <p className="mt-6 text-xs text-muted-foreground/70">© {new Date().getFullYear()} Pico y Placa</p>
      </div>
    </footer>
  );
}

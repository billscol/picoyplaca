import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="mt-auto border-t border-border bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="font-semibold tracking-tight">Pico y Placa</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("disclaimer")}</p>
          </div>
          <nav className="flex gap-8 text-sm">
            <Link href="/ciudades" className="text-muted-foreground hover:text-foreground">
              {tNav("cities")}
            </Link>
            <Link href="/precios" className="text-muted-foreground hover:text-foreground">
              {tNav("pricing")}
            </Link>
            <a
              href={process.env.NEXT_PUBLIC_DOCS_URL ?? "http://localhost:3012/docs"}
              className="text-muted-foreground hover:text-foreground"
            >
              {tNav("docs")}
            </a>
          </nav>
        </div>
        <p className="mt-8 text-xs text-muted-foreground/70">© {new Date().getFullYear()} Pico y Placa</p>
      </div>
    </footer>
  );
}

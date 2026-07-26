"use client";

import { Zap, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-primary transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
            <Zap className="size-4" fill="currentColor" strokeWidth={0} />
          </span>
          <span>Pico y Placa</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link
            href="/ciudades"
            className="relative text-muted-foreground transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:text-foreground hover:after:w-full"
          >
            {t("cities")}
          </Link>
          <Link
            href="/precios"
            className="relative text-muted-foreground transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:text-foreground hover:after:w-full"
          >
            {t("pricing")}
          </Link>
          <a
            href={process.env.NEXT_PUBLIC_DOCS_URL ?? "http://localhost:3012/docs"}
            className="relative text-muted-foreground transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:text-foreground hover:after:w-full"
          >
            {t("docs")}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" render={<Link href="/login" />}>
            {t("login")}
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-primary px-4 text-primary-foreground hover:bg-primary/85"
            render={<Link href="/register" />}
          >
            <Zap className="size-3.5" fill="currentColor" strokeWidth={0} data-icon="inline-start" />
            {t("register")}
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
            <Menu className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

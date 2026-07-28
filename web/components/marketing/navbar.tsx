"use client";

import { useState } from "react";
import { Zap, Menu, X, MapPinned, Tag, BookOpen, Newspaper, LogIn, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  const docsUrl = process.env.NEXT_PUBLIC_DOCS_URL ?? "http://localhost:3012/docs";

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex h-16 items-center justify-between rounded-full border-2 border-foreground/10 bg-white/90 px-4 shadow-(--shadow-hover) backdrop-blur-md sm:px-5">
          <Link href="/" className="group flex items-center gap-2.5 font-bold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-xl bg-foreground text-primary transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Zap className="size-4.5" fill="currentColor" strokeWidth={0} />
            </span>
            <span>Pico y Placa</span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm md:flex">
            <Link
              href="/ciudades"
              className="flex items-center gap-1.5 rounded-full px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <MapPinned className="size-4" />
              {t("cities")}
            </Link>
            <Link
              href="/precios"
              className="flex items-center gap-1.5 rounded-full px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Tag className="size-4" />
              {t("pricing")}
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-1.5 rounded-full px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Newspaper className="size-4" />
              {t("blog")}
            </Link>
            <a
              href={docsUrl}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <BookOpen className="size-4" />
              {t("docs")}
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              render={<Link href="/login" />}
              nativeButton={false}
            >
              {t("login")}
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-primary px-4 text-primary-foreground hover:bg-primary/85"
              render={<Link href="/register" />}
              nativeButton={false}
            >
              <Zap className="size-3.5" fill="currentColor" strokeWidth={0} data-icon="inline-start" />
              {t("register")}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={t("menu")}
              aria-expanded={open}
              aria-controls="mobile-nav-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>

        {open && (
          <nav
            id="mobile-nav-menu"
            className="animate-in fade-in slide-in-from-top-2 fill-mode-both mt-2 flex flex-col gap-1 rounded-2xl border-2 border-foreground/10 bg-white/95 p-2 text-sm shadow-(--shadow-hover) backdrop-blur-md duration-200 md:hidden"
          >
            <Link
              href="/ciudades"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <MapPinned className="size-4" />
              {t("cities")}
            </Link>
            <Link
              href="/precios"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Tag className="size-4" />
              {t("pricing")}
            </Link>
            <Link
              href="/blog"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Newspaper className="size-4" />
              {t("blog")}
            </Link>
            <a
              href={docsUrl}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <BookOpen className="size-4" />
              {t("docs")}
            </a>
            <div className="my-1 border-t border-border" />
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogIn className="size-4" />
              {t("login")}
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <UserPlus className="size-4" />
              {t("register")}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

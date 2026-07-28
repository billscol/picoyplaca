import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Newspaper, ArrowUpRight } from "lucide-react";
import { Link, getPathname } from "@/navigation";
import { routing } from "@/i18n/routing";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAllPosts } from "@/lib/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const languages = Object.fromEntries(routing.locales.map((l) => [l, getPathname({ locale: l, href: "/blog" })]));
  languages["x-default"] = languages[routing.defaultLocale];
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: { canonical: getPathname({ locale, href: "/blog" }), languages },
  };
}

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const tBreadcrumb = await getTranslations("city_page.breadcrumb");
  const loc = locale === "en" ? "en" : "es";

  const posts = getAllPosts().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tBreadcrumb("home"), item: `${siteUrl}${getPathname({ locale, href: "/" })}` },
      { "@type": "ListItem", position: 2, name: t("title"), item: `${siteUrl}${getPathname({ locale, href: "/blog" })}` },
    ],
  };

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="bg-hero-wash">
        <div className="mx-auto max-w-5xl px-4 pt-12 pb-8 text-center sm:pt-16 sm:pb-10">
          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:tracking-[-0.03em]">
            {t("title")}
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mx-auto mt-3 max-w-xl text-lg text-muted-foreground duration-700 delay-150">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <div className="grid gap-4">
          {posts.map((post) => (
            <Link key={post.slug} href={{ pathname: "/blog/[slug]", params: { slug: post.slug } }} className="group">
              <Card className="card-hover-lift h-full border-2 border-foreground/8 p-2">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-foreground">
                      <Newspaper className="size-5" />
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </div>
                  <CardTitle as="h2" className="mt-3 text-lg font-bold">
                    {post.title[loc]}
                  </CardTitle>
                  <CardDescription>{post.description[loc]}</CardDescription>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    {dateFormatter.format(new Date(post.publishedAt))}
                  </p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

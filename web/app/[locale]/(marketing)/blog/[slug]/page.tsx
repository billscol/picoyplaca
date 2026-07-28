import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
import { Link, getPathname } from "@/navigation";
import { routing } from "@/i18n/routing";
import { getAllPosts, getPost } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const loc = locale === "en" ? "en" : "es";

  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, getPathname({ locale: l, href: { pathname: "/blog/[slug]", params: { slug } } })])
  );
  languages["x-default"] = languages[routing.defaultLocale];

  return {
    title: post.title[loc],
    description: post.description[loc],
    alternates: {
      canonical: getPathname({ locale, href: { pathname: "/blog/[slug]", params: { slug } } }),
      languages,
    },
    openGraph: { type: "article", publishedTime: post.publishedAt, modifiedTime: post.updatedAt },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPost(slug);
  if (!post) notFound();

  const loc = locale === "en" ? "en" : "es";
  const t = await getTranslations("blog");
  const tBreadcrumb = await getTranslations("city_page.breadcrumb");
  const Body = post.Body[loc];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const homePath = getPathname({ locale, href: "/" });
  const blogPath = getPathname({ locale, href: "/blog" });
  const postPath = getPathname({ locale, href: { pathname: "/blog/[slug]", params: { slug } } });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title[loc],
    description: post.description[loc],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: locale,
    author: { "@type": "Organization", name: "Pico y Placa Global" },
    publisher: { "@type": "Organization", name: "Pico y Placa Global" },
    mainEntityOfPage: `${siteUrl}${postPath}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tBreadcrumb("home"), item: `${siteUrl}${homePath}` },
      { "@type": "ListItem", position: 2, name: t("title"), item: `${siteUrl}${blogPath}` },
      { "@type": "ListItem", position: 3, name: post.title[loc], item: `${siteUrl}${postPath}` },
    ],
  };

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="bg-hero-wash">
        <div className="mx-auto max-w-3xl px-4 pt-8 pb-6 sm:pt-10">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">{tBreadcrumb("home")}</Link>
            {" / "}
            <Link href="/blog" className="hover:text-foreground">{t("title")}</Link>
          </nav>

          <div className="mt-5 flex items-start gap-4">
            <span className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-foreground shadow-(--shadow-hover) sm:flex">
              <Newspaper className="size-6" />
            </span>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl md:tracking-[-0.03em]">
                {post.title[loc]}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{dateFormatter.format(new Date(post.publishedAt))}</p>
            </div>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 pb-20">
        <Body />
      </article>
    </>
  );
}

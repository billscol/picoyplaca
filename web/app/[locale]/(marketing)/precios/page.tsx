import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";

interface Plan {
  code: string;
  name: string;
  price_monthly_usd: string;
  requests_month_quota: number;
  burst_per_minute: number;
}

async function getPlans(): Promise<Plan[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/plans`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricing");
  const plans = await getPlans();

  const featuredIndex = Math.floor(plans.length / 2);

  return (
    <>
      <section className="bg-hero-wash">
        <div className="mx-auto max-w-5xl px-4 pt-16 pb-8 text-center sm:pt-24">
          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:tracking-[-0.03em]">
            {t("title")}
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mx-auto mt-3 max-w-xl text-lg text-muted-foreground duration-700 delay-150">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan, i) => {
            const featured = i === featuredIndex && plans.length > 1;
            return (
              <Card
                key={plan.code}
                className={`card-hover-lift animate-in fade-in slide-in-from-bottom-4 fill-mode-both relative duration-500 ${
                  featured ? "border-2 border-primary shadow-(--shadow-hover)" : "border-border"
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {t("featured")}
                  </span>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-3xl font-bold tracking-tight">
                    ${plan.price_monthly_usd}
                    <span className="text-sm font-normal text-muted-foreground">{t("month")}</span>
                  </p>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>
                    {plan.requests_month_quota < 0
                      ? t("unlimited_requests")
                      : t("requests_per_month", { count: plan.requests_month_quota.toLocaleString() })}
                  </p>
                  <p>{t("requests_per_minute", { count: plan.burst_per_minute })}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${featured ? "bg-primary text-primary-foreground hover:bg-primary/85" : ""}`}
                    variant={featured ? undefined : "outline"}
                    render={<Link href="/register" />}
                  >
                    {t("cta")}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}

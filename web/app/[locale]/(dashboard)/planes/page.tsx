"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import api from "@/lib/api";

interface Plan {
  code: string;
  name: string;
  price_monthly_usd: string;
  requests_month_quota: number;
}

export default function PlanesPage() {
  const t = useTranslations("dashboard");
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    api.get("/billing/plans").then(({ data }) => setPlans(data.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("plan_title")}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.code}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="text-2xl font-bold text-foreground">${plan.price_monthly_usd}/mes</p>
              <p>{plan.requests_month_quota < 0 ? "Ilimitado" : `${plan.requests_month_quota.toLocaleString()} requests/mes`}</p>
              <p className="mt-2 text-xs">
                Integracion de pago (Stripe/Wompi) pendiente de credenciales reales — ver StripeService/WompiService.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

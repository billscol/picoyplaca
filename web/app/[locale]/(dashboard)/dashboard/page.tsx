"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";

interface Me {
  subscription_plan: string;
  subscription_status: string;
  subscription_ends_at: string | null;
}

export default function DashboardHomePage() {
  const t = useTranslations("dashboard");
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    api.get("/billing/me").then(({ data }) => setMe(data.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("plan_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {me ? (
            <div className="text-sm">
              <p>
                Plan: <span className="font-medium capitalize">{me.subscription_plan}</span> ({me.subscription_status})
              </p>
              {me.subscription_ends_at && <p className="text-muted-foreground">Vence: {me.subscription_ends_at}</p>}
            </div>
          ) : (
            <Skeleton className="h-5 w-40" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

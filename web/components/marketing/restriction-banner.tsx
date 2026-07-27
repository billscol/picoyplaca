import type { ReactNode } from "react";
import { CircleCheck, CircleAlert, RefreshCcw, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type BannerStatus = "free" | "restricted" | "info";

const STATUS_STYLE: Record<BannerStatus, { chip: string; ring: string; icon: LucideIcon; pulse?: boolean }> = {
  free: { chip: "bg-primary text-primary-foreground", ring: "border-primary/30 bg-primary/10", icon: CircleCheck },
  restricted: {
    chip: "bg-foreground text-background",
    ring: "border-foreground/12 bg-secondary",
    icon: CircleAlert,
    pulse: true,
  },
  info: { chip: "bg-vermillion text-white", ring: "border-vermillion/25 bg-vermillion/8", icon: RefreshCcw },
};

/** Big icon-led status banner — the shared visual language for "today", digit-lookup and rotating-rule results. */
export function RestrictionBanner({
  status,
  headline,
  subline,
  meta,
  size = "lg",
  className,
}: {
  status: BannerStatus;
  headline: string;
  subline?: string;
  meta?: ReactNode;
  size?: "lg" | "md";
  className?: string;
}) {
  const s = STATUS_STYLE[status];
  const Icon = s.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-2xl border px-5 py-4",
        s.ring,
        size === "md" && "gap-3 px-4 py-3.5",
        className
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-2xl",
          size === "lg" ? "size-13 rounded-2xl" : "size-10 rounded-xl",
          s.chip,
          s.pulse && "animate-pulse-ring"
        )}
      >
        <Icon className={size === "lg" ? "size-6" : "size-5"} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("font-bold text-balance", size === "lg" ? "text-lg leading-tight" : "text-sm leading-snug")}>
          {headline}
        </p>
        {subline && <p className="mt-0.5 text-xs text-muted-foreground">{subline}</p>}
        {meta && <div className="mt-2.5 flex flex-wrap items-center gap-1.5">{meta}</div>}
      </div>
    </div>
  );
}

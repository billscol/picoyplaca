import type { ReactNode } from "react";
import { Globe, Mail, Headset } from "lucide-react";
import type { City } from "@/lib/pico-placa";
import type { Translator } from "@/lib/city-seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.397 20.997v-8.196h2.75l.413-3.19h-3.163V7.548c0-.923.256-1.554 1.582-1.554h1.69V3.144A22.5 22.5 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.38H7.332v3.19h2.747v8.196z" />
    </svg>
  );
}

function ChannelLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-3 rounded-xl px-2.5 py-2 -mx-2.5 transition-colors hover:bg-secondary"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-transform duration-200 group-hover:scale-110">
        {icon}
      </span>
      <span className="truncate text-sm font-medium">{label}</span>
    </a>
  );
}

export function CityContactSection({ city, t }: { city: City; t: Translator }) {
  const channels = city.contact_channels;
  const hasChannels = Boolean(channels?.twitter_url || channels?.facebook_url || channels?.website_url || channels?.email);

  return (
    <Card className="card-hover-lift animate-in fade-in slide-in-from-bottom-4 border-2 border-foreground/8 delay-100 duration-500 fill-mode-both">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-magenta-pop/12 text-magenta-pop">
            <Headset className="size-5" />
          </span>
          <CardTitle className="text-base font-bold">{t("contact.title")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasChannels && (
          <>
            <div className="space-y-1">
              {channels?.twitter_url && (
                <ChannelLink href={channels.twitter_url} icon={<XIcon className="size-4" />} label={t("contact.twitter")} />
              )}
              {channels?.facebook_url && (
                <ChannelLink
                  href={channels.facebook_url}
                  icon={<FacebookIcon className="size-4" />}
                  label={t("contact.facebook")}
                />
              )}
              {channels?.website_url && (
                <ChannelLink href={channels.website_url} icon={<Globe className="size-4" />} label={t("contact.website")} />
              )}
              {channels?.email && (
                <ChannelLink href={`mailto:${channels.email}`} icon={<Mail className="size-4" />} label={channels.email} />
              )}
            </div>
          </>
        )}

        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium">{t("contact.feedback")}</p>
          <a
            href="mailto:soporte@picoyplaca.app"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {t("contact.feedback_cta")}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

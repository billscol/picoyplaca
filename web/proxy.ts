import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // apple-icon has no dot in its URL (unlike favicon.ico/robots.txt/sitemap.xml/manifest.webmanifest,
  // which the .*\..* exclusion already catches), so it needs an explicit exclusion — otherwise this
  // middleware rewrites it to a locale-prefixed path (/es/apple-icon) that doesn't exist and 404s.
  matcher: ["/((?!api|_next|_vercel|apple-icon|.*\\..*).*)"],
};

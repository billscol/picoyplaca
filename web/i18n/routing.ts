import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/precios": { es: "/precios", en: "/pricing" },
    "/ciudades": { es: "/ciudades", en: "/cities" },
    "/ciudades/[slug]": { es: "/ciudades/[slug]", en: "/cities/[slug]" },
    "/ciudades/pais/[country]": { es: "/ciudades/pais/[country]", en: "/cities/country/[country]" },
    "/blog": { es: "/blog", en: "/blog" },
    "/blog/[slug]": { es: "/blog/[slug]", en: "/blog/[slug]" },
    "/login": { es: "/login", en: "/login" },
    "/register": { es: "/registro", en: "/register" },
    "/dashboard": { es: "/dashboard", en: "/dashboard" },
    "/api-keys": { es: "/api-keys", en: "/api-keys" },
    "/planes": { es: "/planes", en: "/plans" },
  },
});

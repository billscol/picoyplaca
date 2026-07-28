import type { ComponentType } from "react";
import GuiaColombiaEs from "@/content/blog/pico-y-placa-colombia-guia-2026/es";
import GuiaColombiaEn from "@/content/blog/pico-y-placa-colombia-guia-2026/en";
import ExcepcionesEs from "@/content/blog/vehiculos-exceptuados-pico-y-placa/es";
import ExcepcionesEn from "@/content/blog/vehiculos-exceptuados-pico-y-placa/en";
import MultaEs from "@/content/blog/multa-pico-y-placa-colombia/es";
import MultaEn from "@/content/blog/multa-pico-y-placa-colombia/en";

export interface BlogPostMeta {
  slug: string;
  title: Record<"es" | "en", string>;
  description: Record<"es" | "en", string>;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
}

export interface BlogPostEntry extends BlogPostMeta {
  Body: Record<"es" | "en", ComponentType>;
}

const registry: BlogPostEntry[] = [
  {
    slug: "pico-y-placa-colombia-guia-2026",
    title: {
      es: "Pico y placa en Colombia 2026: guía completa por ciudad",
      en: "Pico y placa in Colombia 2026: a complete city-by-city guide",
    },
    description: {
      es: "Cómo funciona el pico y placa en las principales ciudades de Colombia, qué tienen en común y en qué se diferencian Bogotá, Medellín, Cali, Bucaramanga, Cartagena y Barranquilla.",
      en: "How pico y placa works across Colombia's major cities, what they share, and how Bogotá, Medellín, Cali, Bucaramanga, Cartagena and Barranquilla differ.",
    },
    publishedAt: "2026-07-27",
    updatedAt: "2026-07-27",
    tags: ["colombia", "pico-y-placa", "guia"],
    Body: { es: GuiaColombiaEs, en: GuiaColombiaEn },
  },
  {
    slug: "vehiculos-exceptuados-pico-y-placa",
    title: {
      es: "Vehículos exceptuados del pico y placa: eléctricos, híbridos y más",
      en: "Vehicles exempt from pico y placa: electric, hybrid and more",
    },
    description: {
      es: "Qué vehículos están exceptuados del pico y placa en las ciudades colombianas — eléctricos, híbridos, gas natural, discapacidad — y en qué varía cada ciudad.",
      en: "Which vehicles are exempt from pico y placa in Colombian cities — electric, hybrid, natural gas, disability — and how each city differs.",
    },
    publishedAt: "2026-07-27",
    updatedAt: "2026-07-27",
    tags: ["colombia", "excepciones", "vehiculos-electricos"],
    Body: { es: ExcepcionesEs, en: ExcepcionesEn },
  },
  {
    slug: "multa-pico-y-placa-colombia",
    title: {
      es: "Multa por pico y placa en Colombia: cuánto cuesta y qué pasa si te cogen",
      en: "Pico y placa fine in Colombia: how much it costs and what happens if you're caught",
    },
    description: {
      es: "La multa por circular en pico y placa en Colombia es de 15 SMLDV en todas las ciudades revisadas, con inmovilización del vehículo. Te explicamos la norma y qué significa en la práctica.",
      en: "The fine for driving during pico y placa in Colombia is 15 SMLDV in every city we checked, with vehicle impoundment. We explain the rule and what it means in practice.",
    },
    publishedAt: "2026-07-27",
    updatedAt: "2026-07-27",
    tags: ["colombia", "multas", "sanciones"],
    Body: { es: MultaEs, en: MultaEn },
  },
];

export function getAllPosts(): BlogPostMeta[] {
  return registry.map(({ slug, title, description, publishedAt, updatedAt, tags }) => ({
    slug,
    title,
    description,
    publishedAt,
    updatedAt,
    tags,
  }));
}

export function getPost(slug: string): BlogPostEntry | undefined {
  return registry.find((p) => p.slug === slug);
}

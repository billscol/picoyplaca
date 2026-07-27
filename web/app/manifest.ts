import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pico y Placa Global",
    short_name: "Pico y Placa",
    description: "Consulta pico y placa, zonas de bajas emisiones y peajes de congestión en LatAm, USA y España.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f9f9",
    theme_color: "#000000",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

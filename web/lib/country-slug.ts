/** URL-safe slug from a country name ("São Paulo" -> "sao-paulo", "España" -> "espana"). */
export function slugifyCountry(countryName: string): string {
  return countryName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

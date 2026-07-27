const INDEXNOW_KEY = "22ef66b07336b4ca5ea29e6a70414ad6";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * Notifies IndexNow-participating search engines (Bing, Yandex, Naver, Seznam) that URLs
 * changed, so they can re-crawl sooner than their own schedule. Google does not participate.
 * Call this from wherever city rules get published/updated (currently the scraping pipeline
 * lives in the separate api/ backend, not this app) — not wired to an automatic trigger yet.
 */
export async function submitUrlsToIndexNow(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const host = new URL(siteUrl).host;

  try {
    await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${siteUrl}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Best-effort notification — a failure here should never affect the caller.
  }
}

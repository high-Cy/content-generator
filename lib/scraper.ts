import { db } from "./db";
import { scrapeCache } from "./db/schema";
import { eq, gt, and } from "drizzle-orm";
import type { ScrapeResponse } from "./types";

// ─── scrapeUrl ────────────────────────────────────────────────────────────────
// 1. Check Supabase scrape_cache — return if not expired (24h TTL)
// 2. On miss → call Python scraper microservice
// 3. Cache result → return

export const scrapeUrl = async (url: string): Promise<ScrapeResponse> => {
  // Cache lookup
  const cached = await db
    .select()
    .from(scrapeCache)
    .where(and(eq(scrapeCache.url, url), gt(scrapeCache.expiresAt, new Date())))
    .limit(1);

  if (cached.length > 0) {
    return { title: cached[0].title, content: cached[0].content, fromCache: true };
  }

  // Call scraper microservice
  const scraperUrl = process.env.SCRAPER_SERVICE_URL;
  if (!scraperUrl) throw new Error("SCRAPER_SERVICE_URL is not configured");

  const res = await fetch(`${scraperUrl}/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.SCRAPER_API_KEY ?? "",
    },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Scraper error" }));
    throw new Error(err.error ?? "Failed to scrape URL");
  }

  const data = await res.json();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Write to cache (upsert on url conflict)
  await db
    .insert(scrapeCache)
    .values({ url, title: data.title, content: data.content, expiresAt })
    .onConflictDoUpdate({
      target: scrapeCache.url,
      set: {
        title: data.title,
        content: data.content,
        scrapedAt: new Date(),
        expiresAt,
      },
    });

  return { title: data.title, content: data.content, fromCache: false };
};


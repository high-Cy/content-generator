import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { scrapeUrl } from "@/lib/scraper";
import { rateLimit } from "@/lib/rateLimit";

export const POST = async (req: NextRequest) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!rateLimit("scrape", 30, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { url } = await req.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    new URL(url); // Validate URL format
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const result = await scrapeUrl(url);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
};

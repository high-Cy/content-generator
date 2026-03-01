// ─── API Request / Response ────────────────────────────────────────────────────

export interface GenerateRequest {
  restaurantName: string;
  restaurantAddress?: string;
  foodOrdered: string;
  examplePosts?: string;
  scrapedContent?: string;
  sourceUrls?: string;
}

export interface GenerateResponse {
  output: string;
  generationId: string;
}

export interface ScrapeRequest {
  url: string;
}

export interface ScrapeResponse {
  title: string | null;
  content: string;
  fromCache: boolean;
}

export type GenerationStatus = "completed" | "failed";

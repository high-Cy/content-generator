// ─── API Request / Response ────────────────────────────────────────────────────

export interface GenerateRequest {
  restaurantName: string;
  restaurantAddress?: string;
  foodOrdered: string;
  examplePosts?: string;
}

export interface GenerateResponse {
  output: string;
  generationId: string;
}

export type GenerationStatus = "completed" | "failed";

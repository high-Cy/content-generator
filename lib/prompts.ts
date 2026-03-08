import type { GenerateRequest } from "./types";
import { buildBannedWordsPrompt } from "./bannedWords";

const SYSTEM_PROMPT = process.env.BEDROCK_SYSTEM_PROMPT ?? "";

export const buildPrompt = (
  input: GenerateRequest
): { system: string; userPrompt: string } => {
  const system = SYSTEM_PROMPT + buildBannedWordsPrompt();

  const lines = [
    `Restaurant: ${input.restaurantName}`,
    `Address: ${input.restaurantAddress ?? "unknown"}`,
    `Food ordered: ${input.foodOrdered}`,
  ];

  if (input.examplePosts?.trim()) {
    lines.push(
      ``,
      `Reference posts — match this voice and structure, do NOT copy directly:`,
      input.examplePosts.trim()
    );
  }

  return { system, userPrompt: lines.join("\n") };
};

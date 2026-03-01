import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "ap-southeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID;

// ─── generatePost ─────────────────────────────────────────────────────────────
// Uses Anthropic Claude message format (works for all Claude models on Bedrock).
// To use a non-Claude model, update the request body format accordingly.

export const generatePost = async (
  systemPrompt: string,
  userPrompt: string
): Promise<string> => {
  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.content[0].text as string;
};
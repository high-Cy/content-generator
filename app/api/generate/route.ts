import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveAccess } from "@/lib/access";
import { generatePost } from "@/lib/ai";
import { buildPrompt } from "@/lib/prompts";
import { db } from "@/lib/db";
import { generations } from "@/lib/db/schema";
import { rateLimit } from "@/lib/rateLimit";
import type { GenerateRequest } from "@/lib/types";

export const POST = async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await resolveAccess(session.user.email);
  if (access.status !== "approved") {
    return NextResponse.json({ error: "Access not approved" }, { status: 403 });
  }

  if (!rateLimit("generate", 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Rate limit exceeded — 20 requests per hour" }, { status: 429 });
  }

  const body: GenerateRequest = await req.json();

  if (!body.restaurantName?.trim()) {
    return NextResponse.json({ error: "restaurantName is required" }, { status: 400 });
  }
  if (!body.foodOrdered?.trim()) {
    return NextResponse.json({ error: "foodOrdered is required" }, { status: 400 });
  }

  const { system, userPrompt } = buildPrompt(body);

  let output: string;
  try {
    output = await generatePost(system, userPrompt);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const userId = session.user.id;
  if (!userId) {
    // Sign-in happened while the DB was unreachable — output can't be saved
    return NextResponse.json({ output, generationId: null });
  }

  try {
    const [record] = await db
      .insert(generations)
      .values({
        userId,
        restaurantName: body.restaurantName,
        restaurantAddress: body.restaurantAddress ?? null,
        foodOrdered: body.foodOrdered,
        promptUsed: userPrompt,
        output,
        status: "completed",
      })
      .returning({ id: generations.id });

    return NextResponse.json({ output, generationId: record.id });
  } catch {
    return NextResponse.json({ output, generationId: null });
  }
};

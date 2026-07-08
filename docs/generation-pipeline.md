# Generation Pipeline — Form to Rednote Post

The end-to-end path of a generation, and why each hop exists.

```
GenerateForm (client)                 app/generate/GenerateForm.tsx
   │  POST /api/generate  { restaurantName, restaurantAddress?,
   │                        foodOrdered, focusBrief?, examplePosts? }
   ▼
API route                             app/api/generate/route.ts
   │  1. auth()            → 401 no session
   │  2. resolveAccess()   → 403 signed in but not approved
   │  3. rateLimit()       → 429 over 20 requests/hour
   │  4. validate          → 400 missing name/food
   ▼
buildPrompt(body)                     lib/prompts.ts
   │  system = BEDROCK_SYSTEM_PROMPT + banned-words guidance
   │  userPrompt = structured lines from the form fields
   ▼
generatePost(system, userPrompt)      lib/ai.ts → AWS Bedrock
   ▼
db.insert(generations)                best-effort — failure tolerated
   ▼
{ output, generationId }  → rendered in the output panel, saved toast
```

## The client form

`GenerateForm` is one of the few client components. Required fields: restaurant name +
food ordered; optional: address, a focus brief, and up to a few **example posts** (collapsed
by default) that the model mimics for voice. It POSTs JSON, shows the result in a
scrollable panel with copy-to-clipboard, and surfaces failures via toast. No AI logic lives
client-side — the browser never sees AWS credentials or the system prompt.

## Prompt assembly (`lib/prompts.ts` + `lib/bannedWords.ts`)

Two-part prompt, Claude-style:

- **System prompt** — the persona/instructions live in the `BEDROCK_SYSTEM_PROMPT` env
  var, *not* in code. Iterating on the voice = editing an env var in Vercel, no deploy.
  Appended to it is `buildBannedWordsPrompt()`.
- **User prompt** — deterministic lines built from the form: restaurant, address (or an
  instruction to infer/omit it), food, optional focus, optional reference posts with a
  "match the voice, don't copy" instruction. This exact string is persisted as
  `promptUsed`, so any surprising output can be traced to precisely what the model saw.

**Banned words (违禁词):** Rednote moderation punishes exaggerated ad-speak ("最", "第一",
"国家级"…). `lib/bannedWords.ts` keeps categorised lists, each word with softer suggested
alternatives. Only categories flagged `foodRelevant` are injected (medical/cosmetics
claims aren't worth the tokens), and suggestions are labelled inspiration-only so the
model adapts rather than doing mechanical substitution.

## The Bedrock call (`lib/ai.ts`)

`InvokeModelCommand` with the **Anthropic messages format** (`anthropic_version:
"bedrock-2023-05-31"`, `max_tokens: 2048`, one user message). The model is chosen by the
`BEDROCK_MODEL_ID` env var — swapping Claude versions is a config change. The request body
format is Claude-specific though: a non-Claude model would need a different body.

Bedrock errors bubble up as a **502** with the error message — the route treats the AI as
an upstream service.

## Persistence — output must survive a DB failure

The insert into `generations` happens *after* generation succeeded, and every failure path
still returns the post:

- DB insert throws → respond `{ output, generationId: null }`
- No `userId` on the session (signed in while DB was down) → skip the insert entirely

Rationale: the user just spent real tokens; losing the output to a history-logging failure
would be the worst trade. History (`/history`) simply won't show that entry.

## Rate limiting (`lib/rateLimit.ts`)

A `Map` in module scope: key → `{ count, resetAt }`, fixed 1-hour window, limit 20. It is
deliberately naive — single-user app, so no Redis. Two consequences worth knowing on
serverless: each warm function instance has its *own* map (the real limit is per-instance),
and a cold start resets it. Fine as a cost guard against runaway loops; not a security
boundary. The key is currently the constant `"generate"` — global, not per-user, which is
correct for a tool with a handful of trusted users sharing the owner's AWS bill.

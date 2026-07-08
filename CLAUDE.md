# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Fawn** — a private, invite-only web app that generates Rednote (小红书) restaurant-review posts
via AWS Bedrock (Claude). Single owner plus a handful of invited users; no public sign-up, no
multi-tenancy. Next.js 16 (App Router) + TypeScript strict + MUI v6, deployed on Vercel.

> Note: an earlier spec described Notion integration, a Python scraper, and `/dashboard` routes.
> None of that exists anymore — trust the code, not old docs.

## Commands

```bash
npm run dev            # dev server (localhost:3000)
npm run build          # production build — use this + lint as the verification gate
npm run lint           # ESLint
npm run test           # stub — no tests exist yet ("echo 'No test yet'")

# DB scripts are wrapped with dotenv -e .env.local — they need that file present
npm run db:push        # push schema straight to Supabase (dev)
npm run db:generate    # generate migration SQL into drizzle/ (commit these)
npm run db:migrate     # apply migrations
npm run db:studio      # Drizzle Studio GUI
npm run db:seed-admin  # seed ADMIN_EMAIL as admin in allowed_users
npm run db:whitelist add|remove|list [email]   # manage access CLI
```

CI (`.github/workflows/cicd.yml`): lint + test on every push/PR; merge to `main` deploys to
Vercel via CLI. There is no typecheck step in CI — run `npx tsc --noEmit` yourself.

## Architecture

### Auth & access control (see docs/auth-whitelist-current-flow.md and docs/nextauth-architecture.md)

Auth.js v5, JWT sessions (no DB adapter). Two Google providers in `auth.ts`:
- **Google OAuth** (redirect flow) — access gated in the `signIn()` callback
- **Google One Tap** (Credentials provider) — ID token verified server-side with
  `google-auth-library`, access gated in `authorize()`

**Any change to access logic must be applied to BOTH paths.** Both call `getUserAccess(email)`
(`lib/db/users.ts`), which checks the `allowed_users` table (email + role `admin|user`) — a DB
whitelist, not an env-var check. Not whitelisted → sign-in rejected. Successful sign-ins upsert
into `users` (profile log; not consulted for access). `role` is stored but not yet enforced
anywhere.

Route protection: `proxy.ts` (Next.js 16 renamed middleware → proxy; export must be named
`proxy`) re-exports `auth` from `@/auth`; redirect logic lives in the `authorized()` callback in
`auth.config.ts` (logged-in on `/` → `/generate`; logged-out elsewhere → `/`). API routes
independently verify `await auth()`.

### Generation flow

`app/generate/GenerateForm.tsx` → `POST /api/generate` → session check → in-memory rate limit
(20/hour, `lib/rateLimit.ts`) → `buildPrompt()` (`lib/prompts.ts`) → `generatePost()`
(`lib/ai.ts`, Bedrock `InvokeModelCommand`, Anthropic message format) → insert into
`generations`. If the DB insert fails, the output is still returned with `generationId: null` —
generation must never be lost to a DB error.

Prompt specifics:
- The system prompt lives in the `BEDROCK_SYSTEM_PROMPT` env var, not in code.
- `lib/bannedWords.ts` appends Rednote 违禁词 (banned-word) guidance to the system prompt;
  only `foodRelevant` categories are injected to save tokens.

### Database

Supabase Postgres through Drizzle ORM only — no raw SQL, no `@supabase/supabase-js`. Schema is
`lib/db/schema.ts` (tables: `users`, `allowed_users`, `generations`); client is `lib/db/index.ts`
(server-only — never import `db` in client components). Use inferred types
(`typeof users.$inferSelect`) instead of hand-written interfaces for rows. `DATABASE_URL` is the
pooled (pgbouncer) connection for runtime; `DIRECT_URL` is for migrations only.

### Design system

Single source of truth is `lib/theme.ts` (`PALETTE` + MUI theme). Hard rules: no border-radius
(`borderRadius: 0` globally), no gradients, no hardcoded hex — use `PALETTE.x` /
`alpha(PALETTE.x, n)`.

Two layers, both consumed via barrel imports only:
1. `@/components/styled` — MUI `styled()` primitives (PageWrapper, Section, Eyebrow, Card,
   SpacedRow, …). Use these instead of raw `sx` for layout/typography/surface patterns; `sx` is
   for one-off spacing tweaks only.
2. `@/components/ui` — props-API wrappers (AppButton, AppInput, AppSelect, AppToast, …).

Files in `components/styled/` must have `"use client"` (Emotion runtime); server components may
still import them. Fonts: Playfair Display (h1–h3) + IBM Plex Mono (everything else) via
`next/font`.

## Conventions

- Components: `const Foo = () => …` with `export default Foo` at the bottom — never
  `export default function`. `lib/` files use named exports only.
- `"use client"` only when state/effects/browser APIs/event handlers demand it; pages that just
  fetch and render stay Server Components.
- Imports via `@/` aliases and barrels — never deep paths like `../../components/ui/AppButton`.
- Never pass functions (e.g. `component={Link}`) from a server component to a client component —
  wrap outside instead: `<Link href="…"><AppButton>…</AppButton></Link>`.
- `useToast` returns `{ toast, showToast, hideToast }`; `AppSelect.onChange` takes
  `SelectChangeEvent<unknown>`.
- API handlers stay thin: parse → auth-check → call `lib/` → respond. Shared request/response
  types live in `lib/types.ts`.

## Environment

All secrets in `.env.local` (never committed) / Vercel dashboard. Only
`NEXT_PUBLIC_GOOGLE_CLIENT_ID` is browser-safe. Key vars: `NEXTAUTH_SECRET`, `ADMIN_EMAIL`,
`GOOGLE_CLIENT_ID/SECRET`, `AWS_*`, `BEDROCK_MODEL_ID`, `BEDROCK_SYSTEM_PROMPT`,
`DATABASE_URL`, `DIRECT_URL`. See README.md for the full template.

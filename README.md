# Fawn — Rednote Content Generator

A private web app that generates polished Rednote (小红书) posts from restaurant details using AWS Bedrock (Claude).

**Stack:** Next.js 16 (App Router) · TypeScript · MUI v7 · Auth.js v5 (Google OAuth + One Tap) · Supabase Postgres via Drizzle ORM · AWS Bedrock · Resend · Vercel · Node 20

## Setup

```bash
npm install
```

Create `.env.local` — never commit this file:

```env
# Auth.js
NEXTAUTH_SECRET=          # openssl rand -base64 32
OWNER_EMAIL=              # owner's email — always has admin access, can never be locked out

# Google OAuth
GOOGLE_CLIENT_ID=         # from Google Cloud Console
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=   # same value, safe for browser

# AWS Bedrock
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-southeast-2
BEDROCK_MODEL_ID=anthropic.claude-3-5-haiku-20241022-v1:0
BEDROCK_SYSTEM_PROMPT=    # system prompt for the AI

# Supabase / Postgres
DATABASE_URL=             # pooled connection (runtime)
DIRECT_URL=               # direct connection (migrations only)

# Resend (owner email on new access request — optional; feature no-ops if unset)
RESEND_API_KEY=           # from resend.com dashboard
RESEND_FROM_EMAIL=        # verified sender, e.g. "Fawn <noreply@yourdomain>" (or onboarding@resend.dev for testing)
```

Set up the database, then run the dev server:

```bash
npm run db:push
npm run dev               # http://localhost:3000
```

> Upgrading a pre-July-2026 database that still has `allowed_users`? Run
> `drizzle/0003_cute_dark_beast.sql` in the Supabase SQL editor instead — `db:push` would
> drop the whitelist without backfilling it into `users`.

## Scripts

```bash
npm run dev / build / lint

npm run db:push                    # Push schema changes to database (the schema workflow)
npm run db:studio                  # Drizzle Studio GUI

npm run db:seed-admin              # Seed the owner as approved admin (optional)
npm run db:whitelist add|remove|list [email]   # Break-glass access CLI
```

## Access Control

Sign-in (Google OAuth or One Tap) only proves identity. New users land on `/pending` until the
owner approves them on `/admin`; approve/deny/revoke take effect on the next request — access
is checked per-request in `lib/access.ts`, never cached in the JWT. The owner (`OWNER_EMAIL`)
is always an approved admin and can never be locked out, even with the database down.

When a new user requests access, the owner gets an email notification (via Resend,
`lib/email.ts`). It's fire-and-forget and no-ops if `RESEND_API_KEY` / `RESEND_FROM_EMAIL` are
unset, so sign-in never depends on it.

## Deployment

Merge to `main` → GitHub Actions (lint + tests) → Vercel auto-deploy. All env vars live in the
Vercel dashboard, including `OWNER_EMAIL` (renamed from `ADMIN_EMAIL`, July 2026). CI has no
typecheck step — run `npx tsc --noEmit` locally.

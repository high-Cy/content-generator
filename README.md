# Fawn — Rednote Content Generator

A private web app that generates polished Rednote (小红书) posts from restaurant details using AWS Bedrock (Claude).

**Stack:** Next.js 16 (App Router) · TypeScript · MUI v7 · Auth.js v5 (Google OAuth + One Tap) · Supabase Postgres via Drizzle ORM · AWS Bedrock · Resend · Vercel · Node 20

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in — see comments in .env.example. Never commit this file.
npm run db:push              # push schema to Supabase
npm run dev                  # http://localhost:3000
```

## Scripts

```bash
npm run dev / build / lint / typecheck

npm run db:push      # push schema changes to database (the schema workflow)
npm run db:studio    # Drizzle Studio GUI
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

Merge to `main` → GitHub Actions (lint + typecheck + tests) → Vercel auto-deploy. All env vars
live in the Vercel dashboard.

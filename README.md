# Fawn — Rednote Content Generator

A private, invite-only web app that generates polished Rednote (小红书) posts from restaurant details using AWS Bedrock (Claude).

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | Material UI v6 |
| Auth | Auth.js v5 — Google OAuth + One Tap |
| AI | AWS Bedrock (`@aws-sdk/client-bedrock-runtime`) |
| Database | Supabase (PostgreSQL) via Drizzle ORM |
| Deployment | Vercel |
| Runtime | Node.js 20 |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

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
```

### 3. Set up the database

**Fresh database:**

```bash
# Push schema to Supabase
npm run db:push

# Seed the owner as approved admin (optional — OWNER_EMAIL is fail-safed in code anyway)
npm run db:seed-admin
```

**Existing database (pre-July-2026, still has `allowed_users`):** apply
`drizzle/0003_cute_dark_beast.sql` by pasting it into the Supabase SQL editor (or via `psql`
on `DIRECT_URL`). It adds the status columns, backfills whitelisted emails as `approved`,
then drops `allowed_users`.

> ⚠️ Do **not** use `npm run db:push` for that upgrade — push diffs schemas without running
> data backfills, so the whitelist would be dropped unmigrated. Note `npm run db:migrate` is
> also currently unusable: the `0000`/`0001` migration SQL files are missing from `drizzle/`
> (only their meta snapshots remain), so the migrator can't replay history.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev                        # Development server
npm run build                      # Production build
npm run lint                       # ESLint

npm run db:push                    # Push schema changes to database
npm run db:generate                # Generate migration SQL files
npm run db:migrate                 # Apply migrations
npm run db:studio                  # Drizzle Studio GUI

npm run db:seed-admin              # Seed the owner as approved admin
npm run db:whitelist add <email>   # Break-glass CLI: approve a user
npm run db:whitelist remove <email># Break-glass CLI: revoke a user
npm run db:whitelist list          # List all users + status
```

## Access Control

Request/approval model. Anyone with a verified Google account can sign in, but new users land
on `/pending` until approved. The owner reviews requests on `/admin` (approve / deny / revoke —
effective on the next request). Access status lives on the `users` table
(`pending | approved | denied | revoked`); the decision logic is `lib/access.ts`.

The owner (`OWNER_EMAIL`) is fail-safed in code: always approved admin, immune to admin
actions, works even if the database is unreachable.

Roles: `admin` (sees `/admin`) and `user`. Both can use all generation features.

## Project Structure

```
app/
├── page.tsx                    # Login page (public)
├── generate/                   # Content generation UI
├── history/                    # Generation history
├── pending/                    # Awaiting-approval page (pending/denied/revoked)
├── admin/                      # Access management (admin only)
├── layout.tsx                  # Root layout — fonts, Navbar, SessionProvider
└── api/
    ├── auth/[...nextauth]/     # Auth.js handler
    └── generate/               # Bedrock → Supabase

components/
├── layout/Navbar.tsx           # Session-aware top nav
├── ui/                         # Interactive component wrappers
└── styled/                     # MUI styled() primitives

lib/
├── db/
│   ├── schema.ts               # All table definitions
│   ├── index.ts                # Drizzle client
│   ├── users.ts                # User + status helpers
│   ├── seed-admin.ts           # Owner seed script
│   └── whitelist.ts            # Break-glass access CLI
├── access.ts                   # resolveAccess/requireAccess — the access decision layer
├── ai.ts                       # Bedrock client + generatePost()
├── prompts.ts                  # System prompt + buildPrompt()
├── theme.ts                    # MUI theme + PALETTE tokens
└── types.ts                    # Shared TypeScript interfaces
```

## Database Schema

| Table | Purpose |
|---|---|
| `users` | Identity + access: profile, `status` (pending/approved/denied/revoked), `role` |
| `generations` | Generated post history |

## Authentication

Auth.js v5 with two providers:
- **Google OAuth** — standard redirect flow
- **Google One Tap** — credential verified server-side via `google-auth-library`

Sign-in only proves identity (verified Google email). Whether the user may use the app is
checked per-request against the database by `lib/access.ts` — on every protected page and API
route — so approvals and revocations apply immediately, without waiting for the JWT to expire.

## Deployment

1. Push to GitHub — CI runs lint + tests (no typecheck; run `npx tsc --noEmit` locally)
2. Vercel auto-deploys on merge to `main`
3. Add all env vars in the Vercel dashboard (never in code)

> Renamed July 2026: `ADMIN_EMAIL` → `OWNER_EMAIL`. Add `OWNER_EMAIL` in Vercel before
> deploying the access-request refactor; `ADMIN_EMAIL` is no longer read and can be removed.

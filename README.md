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
ADMIN_EMAIL=              # email address of the admin account (seeded via db:seed-admin)

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

```bash
# Push schema to Supabase
npm run db:push

# Seed your admin account
npm run db:seed-admin
```

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

npm run db:seed-admin              # Add your account as admin
npm run db:whitelist add <email>   # Grant access to a user
npm run db:whitelist remove <email># Revoke access
npm run db:whitelist list          # List all allowed users
```

## Access Control

Access is controlled by the `allowed_users` table — only whitelisted emails can sign in. Use the whitelist script above to manage access.

Roles: `admin` (you) and `user` (invited guests). Both can use all features.

## Project Structure

```
app/
├── page.tsx                    # Login page (public)
├── generate/                   # Content generation UI
├── history/                    # Generation history
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
│   ├── users.ts                # User access helpers
│   ├── seed-admin.ts           # Admin seed script
│   └── whitelist.ts            # CLI whitelist tool
├── ai.ts                       # Bedrock client + generatePost()
├── prompts.ts                  # System prompt + buildPrompt()
├── theme.ts                    # MUI theme + PALETTE tokens
└── types.ts                    # Shared TypeScript interfaces
```

## Database Schema

| Table | Purpose |
|---|---|
| `users` | Every Google sign-in attempt |
| `allowed_users` | Access control list (email + role) |
| `generations` | Generated post history |

## Authentication

Auth.js v5 with two providers:
- **Google OAuth** — standard redirect flow
- **Google One Tap** — credential verified server-side via `google-auth-library`

Access is enforced at multiple layers: proxy, `authorized()` callback, `signIn()` callback, `authorize()` in Credentials, every page, and every API route.

## Deployment

1. Push to GitHub — CI runs lint + typecheck
2. Vercel auto-deploys on merge to `main`
3. Add all env vars in the Vercel dashboard (never in code)

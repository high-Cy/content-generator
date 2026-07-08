# Architecture — Structure & Request Lifecycle

Fawn is a Next.js 16 **App Router** app. Almost everything renders on the server; client
components exist only where interactivity demands them. There is no separate backend — API
routes and server actions *are* the backend, deployed as Vercel serverless functions.

## Repo layout — where logic lives

```
auth.ts             NextAuth config: providers + callbacks (Node runtime)
auth.config.ts      Slim config piece: the authorized() redirect callback
proxy.ts            Next.js 16's middleware (renamed from middleware.ts)

app/                Routes. Pages are thin — fetch, guard, render.
  page.tsx            /            login (public)
  generate/           /generate    the main tool (guarded)
  history/            /history     past generations (guarded)
  pending/            /pending     awaiting-approval holding page
  admin/              /admin       access management (admin only) + server actions
  api/generate/       POST         the AI endpoint
  api/auth/[...nextauth]/          NextAuth's handler (all /api/auth/* flows)

lib/                All business logic. Pages/routes call into here.
  access.ts           WHO may use the app (the access decision layer)
  ai.ts               Bedrock client + generatePost()
  prompts.ts          buildPrompt() — assembles system + user prompt
  bannedWords.ts      Rednote 违禁词 lists injected into the system prompt
  rateLimit.ts        In-memory rate limiter
  db/                 Drizzle schema, client, user helpers, CLI scripts

components/
  styled/             Layer 1: styled() primitives (layout/typography/surfaces)
  ui/                 Layer 2: props-API wrappers (AppButton, AppInput, …)
  layout/Navbar.tsx   Top nav
  ThemeRegistry.tsx   MUI + Emotion SSR plumbing

drizzle/             Generated SQL migrations (committed)
```

The core rule (from CLAUDE.md): **API handlers stay thin** — parse → auth-check → call
`lib/` → respond. Components hold no business logic.

## What happens on a request

Take `GET /generate` as the canonical example:

```
Browser → Vercel edge
   │
   ▼
proxy.ts (middleware)                      "Do you have a session at all?"
   │  re-exports auth from @/auth; the authorized() callback in auth.config.ts
   │  redirects: logged-out → /, logged-in visiting / → /generate
   ▼
app/generate/page.tsx (server component)   "Are you APPROVED?"
   │  await requirePageAccess()  → lib/access.ts
   │     • no session      → redirect("/")
   │     • not approved    → redirect("/pending")
   ▼
renders <GenerateForm/> (client component)
```

Two distinct questions, answered in two distinct places: the middleware only knows
"session or not" (cheap, runs on every request); *approval* needs a DB read and lives in
`lib/access.ts`, called by each protected page and API route. See [auth.md](auth.md).

And `POST /api/generate`:

```
GenerateForm (client)  ──fetch──►  app/api/generate/route.ts
                                      │ 1. auth() → 401 if no session
                                      │ 2. resolveAccess() → 403 if not approved
                                      │ 3. rateLimit() → 429 (20/hour)
                                      │ 4. validate body → 400
                                      │ 5. buildPrompt() → generatePost() → Bedrock
                                      │ 6. insert into generations (failure tolerated)
                                      ▼
                                   { output, generationId }
```

Details in [generation-pipeline.md](generation-pipeline.md).

## Server vs client components

Default is **server**. A file gets `"use client"` only when it needs state, effects,
browser APIs, or event handlers — e.g. `GenerateForm`, `Navbar`, `LoginButton`. Pages that
fetch-and-render (`history`, `admin`, `pending`) stay server components: they can `await`
the DB directly and ship no JS for the page shell.

Two boundary rules worth internalising:

- A server component **may import** a `"use client"` file — that's how the styled shims
  work. The directive marks where the client bundle *starts*, not who may import it.
- A server component must **never pass a function** (e.g. `component={Link}`) as a prop to
  a client component — props crossing the boundary must be serialisable. Wrap instead:
  `<Link href="…"><AppButton>…</AppButton></Link>`.

Mutations from server-rendered pages use **server actions** (`app/admin/actions.ts`):
plain async functions the framework exposes as POST endpoints, wired to `<form action>`.
Because they're publicly callable, each action re-verifies admin access itself — never
trust that "the button was only rendered for admins".

## Graceful degradation

A deliberate pattern throughout: the app must stay useful when the DB is down.

- `history` and `admin` catch DB errors and render a "database not connected" callout.
- `/api/generate` returns the generated post even if saving it fails (`generationId: null`).
- Sign-in survives a dead DB (the `users` upsert is try/caught) and the owner can still
  get in via the `OWNER_EMAIL` fail-safe, which never touches the DB.

## Deployment

Merge to `main` → GitHub Actions (lint + tests) → Vercel CLI deploy (`.github/workflows/cicd.yml`).
Env vars live only in `.env.local` (dev) and the Vercel dashboard (prod). CI has no
typecheck step — run `npx tsc --noEmit` locally.

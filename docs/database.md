# Database — Supabase, Drizzle, Migrations

Supabase is used purely as **hosted Postgres**. No `@supabase/supabase-js`, no RLS-based
auth, no realtime — Auth.js handles identity, and Drizzle talks to Postgres directly over a
connection string. One database layer instead of two.

## Schema (`lib/db/schema.ts`)

Two tables. The schema file is the single source of truth — migrations are generated from it.

**`users`** — identity *and* access in one row:

| Column | Notes |
|---|---|
| `email` (unique) | The key everything joins on. Always stored lowercase. |
| `emailVerified`, `name`, `givenName`, `familyName`, `locale` | Profile from Google, refreshed on sign-in |
| `status` | `pending → approved / denied`, `approved → revoked`. The access gate. |
| `role` | `admin` (sees /admin) or `user` |
| `approvedAt`, `approvedBy` | Audit trail for approvals |
| `lastSignInAt` | Bumped on every sign-in upsert |

**`generations`** — one row per generated post: `userId` (FK → users, cascade delete),
`restaurantName`, `restaurantAddress`, `foodOrdered`, `promptUsed` (the exact user prompt
sent to the model — great for debugging prompt changes), `output`, `status`.

Enums (`user_status`, `user_role`, `generation_status`) are real Postgres enum types via
`pgEnum`, not text columns — the DB itself rejects invalid values.

## Inferred types — no hand-written row interfaces

```ts
export type User = typeof users.$inferSelect;       // SELECT shape
export type NewUser = typeof users.$inferInsert;    // INSERT shape (defaults optional)
export type UserStatus = User["status"];            // "pending" | "approved" | …
```

Change the schema → every type updates automatically. This is why the convention says
never write manual interfaces for DB rows.

## The client (`lib/db/index.ts`)

```ts
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

Server-only — importing `db` into a client component would try to bundle a Postgres driver
for the browser (and leak the connection string). Queries look like SQL, typed end-to-end:

```ts
await db.select().from(users).where(eq(users.email, email)).limit(1);
await db.insert(generations).values({ ... }).returning({ id: generations.id });
```

Upserts use `onConflictDoUpdate` — see `upsertUser()` in `lib/db/users.ts`, which is careful
to refresh only *profile* fields on conflict, never `status`/`role` (sign-in must not be
able to change access).

## Two connection strings

| Var | Port | What it is | Used by |
|---|---|---|---|
| `DATABASE_URL` | 6543 | **pgbouncer-pooled**. Vercel serverless spawns many short-lived functions; the pooler multiplexes them onto few real connections. | the app at runtime |
| `DIRECT_URL` | 5432 | Direct to Postgres. Needed for DDL/migrations, which pgbouncer's transaction mode handles badly. | migrations, one-off scripts |

## Migration workflow

```bash
# 1. Edit lib/db/schema.ts
# 2. Generate SQL from the diff (compares against drizzle/meta/ snapshots — no DB needed)
npm run db:generate
# 3. Review the SQL, then apply
npm run db:push        # dev-style: diff live DB vs schema and sync it
```

**When a migration moves data, `db:push` is not enough.** Push only diffs *schemas* — it
would happily drop a table you meant to backfill first. Migration
`drizzle/0003_cute_dark_beast.sql` is the worked example: generated SQL wanted to
`DROP TABLE allowed_users` before the new columns even existed, so it was hand-reordered to
*add columns → backfill (`INSERT … SELECT … ON CONFLICT DO UPDATE`) → drop*, and applied as
one transaction. Generated SQL is a starting point — read it before running it.

**Known repo quirk:** `npm run db:migrate` is currently unusable — the `0000`/`0001` SQL
files were deleted from `drizzle/` (their `meta/` snapshots remain, so `db:generate` still
diffs correctly). Apply migrations via `db:push` (schema-only changes) or manually
(data-moving changes).

## CLI helpers

```bash
npm run db:studio                  # Drizzle Studio — browse/edit data in a GUI
npm run db:seed-admin              # upsert OWNER_EMAIL as approved admin
npm run db:whitelist add|remove|list [email]   # break-glass access control, bypasses /admin
```

All are wrapped with `dotenv -e .env.local` in package.json — they need that file present.

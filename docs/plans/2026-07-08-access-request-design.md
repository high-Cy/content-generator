# Access-Request Auth Refactor — Design & Implementation Plan

> Validated 2026-07-08. Companion doc: `docs/auth-whitelist-current-flow.md` (how the old
> whitelist worked). Status: **implemented 2026-07-08** — code is the source of truth; the
> migration (`drizzle/0003_cute_dark_beast.sql`) still needs applying once the Supabase
> project is reachable.

## Goal

Replace the manual CLI whitelist with a request/approval flow:

- Anyone with a Google account can sign in and lands in a **pending** state.
- The owner reviews requests on an in-app **/admin** page and approves/denies/revokes.
- The owner can **never** be locked out, denied, or demoted.
- Google-only for v1, but architected so non-Google emails (magic links) can be added later
  without redesign.

## Architecture decisions

| Decision | Rationale |
|---|---|
| Drop `allowed_users`; put `status` + `role` on `users` | Every requester now signs in and gets a `users` row anyway. A separate whitelist table is duplicate bookkeeping with a sync hazard. One table, one source of truth. |
| `status` enum: `pending → approved / denied`, `approved → revoked` | `denied` (never let in) vs `revoked` (had access, lost it) get different UX copy. Re-approval allowed from any state. |
| Single decision function `resolveAccess(email)` in `lib/access.ts` | Today the access check is duplicated across the OAuth `signIn()` callback and One Tap `authorize()` — easy to change one and miss the other. All identity entry points (including a future magic-link provider) call this one function. |
| `OWNER_EMAIL` env fail-safe checked **before** the DB | `resolveAccess` returns `approved`+`admin` for the owner without touching the DB, and admin mutations refuse to target `OWNER_EMAIL`. The owner can't be locked out by a bad DB state or a misclick. (Reuses the existing `ADMIN_EMAIL` var, renamed for clarity.) |
| Status/role are **not** stored in the JWT | JWTs go stale (default 30 days) — today a revoked user keeps access until expiry. Instead the JWT carries identity only, and `requireAccess()` checks the DB per request. Approval and revocation take effect on the next request. Per-request DB lookup is fine at this scale. |
| `requireAccess(role?)` helper guards layouts + API routes | One place that composes `auth()` + `resolveAccess()`. `proxy.ts` stays a dumb has-session check (it can't cheaply know status). |
| Google's `email_verified` is the email verification | Google asserts it on both providers; no verification emails to send. A separate verify step only becomes relevant with magic links — where clicking the link *is* the verification. |
| Providers = identity acquisition only, keyed on email | Everything downstream (`resolveAccess`, `/pending`, `/admin`) knows only "a verified email". Magic links later = add the NextAuth Email provider + Drizzle adapter token tables; zero changes to the access layer or UI. |
| Keep CLI scripts as break-glass | `db:whitelist` gets rewritten against `users.status`; useful if the UI is ever broken. |

Out of scope for v1 (deliberate YAGNI): email notifications on request/approval, request
messages ("why I want access"), role management UI beyond display, rate limiting sign-ins.

## Data model (`lib/db/schema.ts`)

```ts
export const userStatusEnum = pgEnum("user_status", ["pending", "approved", "denied", "revoked"]);

// users gains:
status:     userStatusEnum("status").notNull().default("pending"),
role:       userRoleEnum("role").notNull().default("user"),
approvedAt: timestamp("approved_at", { withTimezone: true }),
approvedBy: uuid("approved_by"),   // no FK self-reference needed; audit only

// allowed_users: DROPPED
```

Migration order matters (data preserved):
1. Add enum + new columns to `users` (default `pending`).
2. Backfill: for each `allowed_users` row, upsert `users` with `status='approved'`, copy `role`
   (stub rows for emails that never signed in).
3. Drop `allowed_users`.

Written as one generated migration (`npm run db:generate`) plus a data-backfill statement
hand-added between the column-add and the drop. Verify with `db:studio` before dropping.

## Access layer (`lib/access.ts` — new)

```ts
export type AccessStatus = "pending" | "approved" | "denied" | "revoked";
export interface Access { status: AccessStatus; role: "admin" | "user"; isOwner: boolean }

// The ONLY place an access decision is made. All providers + guards call this.
export const resolveAccess = async (email: string): Promise<Access> => {
  if (email.toLowerCase() === process.env.OWNER_EMAIL?.toLowerCase()) {
    return { status: "approved", role: "admin", isOwner: true };  // fail-safe: no DB involved
  }
  const user = await getUserByEmail(email);          // lib/db/users.ts
  if (!user) return { status: "pending", role: "user", isOwner: false };
  return { status: user.status, role: user.role, isOwner: false };
};

// Guard for pages/layouts/API routes. Redirect behaviour for pages, null-return for APIs.
export const requireAccess = async (role?: "admin") => {
  const session = await auth();
  if (!session?.user?.email) return null;
  const access = await resolveAccess(session.user.email);
  if (access.status !== "approved") return null;
  if (role === "admin" && access.role !== "admin") return null;
  return { session, access };
};
```

(Exact shape may flex during implementation — e.g. a `requireAccessOrRedirect` wrapper for
pages vs a nullable variant for API routes — but the decision flow is fixed.)

## Sign-in flow changes (`auth.ts`)

Both providers **stop rejecting non-whitelisted users**:

- **OAuth `signIn()` callback**: require `profile.email_verified` (new — currently unchecked on
  this path). Upsert the user (new rows default `status='pending'`). Return `true` regardless of
  status — the session only proves identity.
- **One Tap `authorize()`**: keep token verification + `email_verified` check; drop the
  `getUserAccess` rejection.
- `upsertUser` must **not** overwrite `status`/`role` on conflict — it only refreshes profile
  fields. Denied users may still sign in; they just land on `/pending` with denied copy.

## Routing & pending page

- `proxy.ts` / `auth.config.ts` `authorized()`: unchanged semantics (session ↔ redirect), except
  the logged-in-on-`/` redirect can keep pointing at `/generate` — the layout guard handles the
  rest.
- **New `/pending` page**: server component; `auth()` + `resolveAccess()`. Copy varies by
  status — pending ("access requested, you'll get in once approved"), denied, revoked. Sign-out
  button. If actually approved → `redirect("/generate")`.
- **Protected pages** (`/generate`, `/history`, `/admin`): guard via `requireAccess()`; not
  approved → `redirect("/pending")`. Cleanest as a shared guard in a route-group layout.
- **API routes** (`/api/generate`): swap the bare session check for `requireAccess()` → 401/403.

## Admin UI (`/admin`)

- Server component guarded by `requireAccess("admin")` (non-admin → redirect).
- Two sections: **Pending requests** (approve / deny) and **All users** (status chip, revoke /
  re-approve). Uses existing `StatusChip`, `AppButton`, styled shims.
- Mutations = server actions in `app/admin/actions.ts` calling new `lib/db/users.ts` functions
  (`setUserStatus(email, status, byUserId)`); each action re-checks `requireAccess("admin")`
  (server actions are public endpoints) and **refuses when target email is `OWNER_EMAIL`**.
- Navbar: "Admin" link rendered only for admins.

## Future: non-Google emails (magic links)

When needed: add the NextAuth **Email provider** (Resend or SES) + the Drizzle adapter for its
`verification_token` table (sessions stay JWT). The provider yields a verified email → same
`upsertUser` + `resolveAccess` path → same pending/approval flow. Nothing else changes. Until
then, Google OAuth already covers Gmail **and** Google Workspace company emails.

## Implementation steps

1. **Schema + migration**: enum, `users` columns, backfill from `allowed_users`, drop table.
   Regenerate types; update `lib/db/users.ts` (`getUserByEmail`, `setUserStatus`; delete
   `getUserAccess`/`grantUserAccess`/`revokeUserAccess`).
2. **Access layer**: `lib/access.ts` (`resolveAccess`, `requireAccess`). Rename env
   `ADMIN_EMAIL` → `OWNER_EMAIL` (code, `.env.local`, Vercel, README).
3. **Auth flow**: update both provider paths in `auth.ts`; add `email_verified` check to OAuth;
   fix `upsertUser` conflict-set to preserve status/role.
4. **Routes**: `/pending` page; guards on `/generate`, `/history`, `/api/generate`.
5. **Admin**: `/admin` page + server actions + Navbar link.
6. **Cleanup**: rewrite `lib/db/whitelist.ts` + `seed-admin.ts` against `users.status`; update
   README + `CLAUDE.md` + `docs/auth-whitelist-current-flow.md` header.
7. **Verify** (manual, no test suite yet): owner signs in with DB row deleted → full access;
   fresh Google account → lands on `/pending`, row created pending, blocked from `/generate` +
   API; approve in `/admin` → next request has access; revoke → immediately bounced to
   `/pending`; deny/re-approve round-trip; admin actions against `OWNER_EMAIL` refused;
   `npm run lint && npx tsc --noEmit && npm run build`.

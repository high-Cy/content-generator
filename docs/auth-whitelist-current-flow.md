# Whitelist Flow — How Access Control Worked Before 2026-07-08 (SUPERSEDED)

> **This document is historical.** The whitelist described below was replaced the same day by
> the request/approval model — see `docs/plans/2026-07-08-access-request-design.md` and
> `lib/access.ts`. Kept as a record of the old behaviour.

## TL;DR

Access is controlled by a Postgres table, `allowed_users`. If your email is in that table,
you can sign in with Google; if not, sign-in is rejected outright. There is **no sign-up,
no request flow, and no in-app management UI** — rows are added via CLI scripts.

## The two tables involved (`lib/db/schema.ts`)

| Table | Purpose |
|---|---|
| `allowed_users` | The whitelist. `email` (unique, stored lowercase) + `role` (`admin` \| `user`) + `createdBy`. Presence in this table = allowed in. |
| `users` | A log/profile of everyone who has **successfully** signed in (name, locale, `lastSignInAt`, …). Upserted on every sign-in. Not consulted for access decisions. |

## Where the check happens

Both login methods call `getUserAccess(email)` (`lib/db/users.ts`), which looks the email up
in `allowed_users`:

1. **Google OAuth button** — `signIn()` callback in `auth.ts:80`. If `!access.isAllowed`,
   returns `false` → NextAuth rejects the sign-in and bounces to `/` (the configured error page).
   If allowed, the user is upserted into `users` and the sign-in proceeds.
2. **Google One Tap** — Credentials provider `authorize()` in `auth.ts:50`. Verifies the
   Google ID token server-side (`google-auth-library`), checks `email_verified` from Google,
   then the same `getUserAccess` check. Throws `"Access denied"` if not whitelisted.

After sign-in, sessions are stateless JWTs (`strategy: "jwt"`, HTTP-only cookie). Route
protection is `proxy.ts` → `authorized()` callback in `auth.config.ts`: logged-in users on `/`
get redirected to `/generate`; logged-out users anywhere else get redirected to `/`.

## How people get whitelisted (manual, CLI only)

```bash
# Seed yourself as admin (reads ADMIN_EMAIL env, falls back to loh.chengyin@gmail.com)
npm run db:seed-admin                      # lib/db/seed-admin.ts

# Manage other people
npm run db:whitelist add friend@example.com
npm run db:whitelist remove friend@example.com
npm run db:whitelist list                  # lib/db/whitelist.ts
```

`lib/db/users.ts` also exports `grantUserAccess()` / `revokeUserAccess()` — currently only
used by the seed script, but they're the natural building blocks for an in-app admin UI.

## What happens to a non-whitelisted person today

They can click "Sign in with Google", complete the Google flow, and then… get silently
bounced back to the landing page. No record of the attempt is kept (the `users` upsert only
runs **after** the whitelist check passes), no message tells them why, and nothing notifies
you. This is the gap the request-access refactor fills.

## Quirks worth knowing before refactoring

- **`role` exists but is never enforced.** `admin` vs `user` is stored and returned by
  `getUserAccess`, but no route or API checks it. An admin UI will need real role checks.
- **Revocation is not immediate.** Sessions are JWTs with no per-request DB check, so someone
  removed from `allowed_users` keeps access until their JWT expires (NextAuth default: 30 days).
- **Two code paths guard sign-in** (OAuth callback + One Tap `authorize`). Any change to the
  access logic must be applied to both — easy to miss one.
- **Google already verifies emails.** One Tap checks `payload.email_verified`; OAuth profile
  carries `email_verified` too. A separate "verify your email" step is redundant while
  Google is the only provider.
- **`docs/nextauth-architecture.md`** covers the broader NextAuth setup; this doc is only
  about the whitelist.

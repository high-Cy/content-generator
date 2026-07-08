# Auth — Identity, Sessions, and the Access Layer

The mental model that makes everything click: **authentication and authorization are fully
separated.**

- **Authentication** (NextAuth): *who are you?* Proves you control a verified Google email.
  Anyone can pass this.
- **Authorization** (`lib/access.ts`): *may you use the app?* A request/approval model the
  owner controls. Checked against the database on every protected request.

Sign-in succeeding means nothing about access — a brand-new user gets a valid session and
immediately lands on `/pending`.

## Authentication: two Google providers (`auth.ts`)

**1. Google OAuth (redirect flow).** The "Continue with Google" button →
`signIn("google")` → Google consent screen → callback to `/api/auth/callback/google` →
NextAuth exchanges the code for the profile. The `signIn()` callback then does exactly one
check: `profile.email_verified === true`.

**2. Google One Tap.** The floating Google prompt (loaded by `LoginButton` from
`accounts.google.com/gsi/client`). Google hands the browser a signed **ID token** (JWT),
which the client posts via `signIn("google-one-tap", { credential })`. This is a NextAuth
*Credentials* provider: its `authorize()` verifies the token server-side with
`google-auth-library` (signature, audience = our client ID) and rejects unverified emails.
You can't just POST a made-up email — the token's signature is checked against Google's keys.

Both providers converge in the `jwt()` callback, which upserts the user into the `users`
table (new emails get `status: 'pending'`) and stores the DB row's id as `token.userId`.
This is the *only* upsert point — the sign-in path never touches status or role.

## Sessions: stateless JWTs

`session: { strategy: "jwt" }` — no session table. The session is an **encrypted, signed
cookie** (`next-auth.session-token`, HTTP-only, Secure in prod, keyed by `NEXTAUTH_SECRET`).
`auth()` decrypts it on the server; the browser can't read or forge it.

The JWT deliberately carries **identity only** (email, userId, picture). Access status and
role are *not* in the token — a JWT lives ~30 days, and anything baked into it stays true
that long. By reading status from the DB per request, an approval or revocation applies on
the literal next request. Don't "optimize" status into the token.

Generic NextAuth mechanics (callback order, token encryption, refresh) are covered in
[nextauth-architecture.md](nextauth-architecture.md).

## Authorization: `lib/access.ts`

One function makes every access decision:

```
resolveAccess(email)
  ├─ email === OWNER_EMAIL?  → approved admin. Decided BEFORE any DB call.
  ├─ users row exists?       → its { status, role }
  ├─ no row?                 → pending
  └─ DB threw?               → pending (fail closed — except the owner, above)
```

`status` is one of `pending | approved | denied | revoked` on the `users` table. Two
wrappers apply the decision:

- `requirePageAccess(role?)` — for pages. Redirects: no session → `/`, not approved →
  `/pending`, admin-only page without admin role → `/generate`.
- `requireAccess(role?)` — for API routes and server actions. Returns `null`; the caller
  responds 401/403.

**The owner fail-safe** exists so a bad DB state, a misclick in `/admin`, or a paused
Supabase project can never lock the owner out: `OWNER_EMAIL` short-circuits to approved
admin without touching the DB, and every admin mutation refuses to target that email.

## The request/approval lifecycle

```
stranger signs in ──► users row created (pending) ──► sees /pending
                                                          │
                     owner opens /admin ◄─────────────────┘
                       ├─ Approve → next request: full access
                       └─ Deny    → /pending shows "declined" copy
approved user … can later be Revoked → next request bounces to /pending
```

`/admin` mutations are server actions (`app/admin/actions.ts`). Each one independently
re-verifies `requireAccess("admin")` and owner-immunity — server actions are public HTTP
endpoints, so UI-level hiding of buttons is not a security boundary.

## Layer map — who checks what

| Layer | File | Checks |
|---|---|---|
| Middleware | `proxy.ts` → `auth.config.ts` `authorized()` | session exists (redirects only) |
| Sign-in | `auth.ts` `signIn()` / `authorize()` | Google email is verified |
| Pages | `requirePageAccess()` per page | status approved (+ role for /admin) |
| API routes | `auth()` + `resolveAccess()` | 401 / 403 |
| Server actions | `requireAccess("admin")` + `isOwnerEmail()` | admin + owner immunity |

## Extending to non-Google emails (future)

Providers only produce a *verified email*; everything downstream is keyed on email. Adding
magic-link sign-in = add NextAuth's Email provider (Resend/SES) + the Drizzle adapter's
verification-token table. `resolveAccess`, `/pending`, and `/admin` need zero changes.
Full rationale: [plans/2026-07-08-access-request-design.md](plans/2026-07-08-access-request-design.md).

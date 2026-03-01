# Next.js Authentication Architecture: Complete Technical Flow

## Executive Summary

This document provides a comprehensive breakdown of NextAuth.js v5 authentication flow in Next.js App Router applications, detailing how sessions, JWTs, middleware, and configuration files interact to provide secure authentication and authorization.

---

## Core Components Overview

### 1. **auth.ts** - Primary Auth Configuration (Server-Side)
**Location:** Root directory  
**Runtime:** Node.js runtime (server-side only)  
**Purpose:** Main NextAuth configuration with full database access, providers, and complex callbacks

**Key Responsibilities:**
- Configures OAuth providers (Google, GitHub, etc.) with client secrets
- Defines session strategy (JWT vs Database)
- Implements authentication callbacks with database access
- Exports `auth()`, `signIn()`, `signOut()`, and `handlers`

**Why it can't run in middleware:**
- Requires Node.js-specific APIs (database connections, crypto operations)
- Uses environment variables that shouldn't be exposed to edge runtime
- Contains provider configurations with client secrets

### 2. **auth.config.ts** - Edge-Compatible Auth Configuration
**Location:** Root directory  
**Runtime:** Edge runtime compatible  
**Purpose:** Lightweight auth configuration for middleware authorization checks

**Key Responsibilities:**
- Defines the `authorized()` callback for middleware route protection
- Contains only edge-compatible logic (no database, no heavy dependencies)
- Used by middleware to make quick authorization decisions

**Critical Limitation:**
- Cannot access database
- Cannot use Node.js APIs
- Cannot verify JWT signatures (relies on NextAuth's internal session handling)
- Receives pre-validated `auth` object from NextAuth

### 3. **proxy.ts** (or middleware.ts) - Request Interceptor
**Location:** Root directory  
**Runtime:** Edge runtime  
**Purpose:** Intercepts ALL requests before they reach pages/API routes

**Key Responsibilities:**
- Runs on every request matching the `matcher` pattern
- Calls NextAuth's `authorized()` callback from auth.config.ts
- Makes routing decisions (allow, redirect, deny)
- CRITICAL: Must use the same auth instance as the rest of the app

---

## Authentication Flow: Step-by-Step

### Phase 1: User Initiates Sign-In

```
User clicks "Sign in with Google"
         ↓
Client-side signIn() called from next-auth/react
         ↓
POST /api/auth/signin/google
         ↓
NextAuth redirects to Google OAuth
```

**What happens:**
1. `signIn("google", { callbackUrl: "/generate" })` is called
2. NextAuth creates an OAuth state parameter and PKCE challenge
3. User is redirected to Google's authorization URL
4. Google OAuth consent screen appears

### Phase 2: OAuth Callback

```
User authorizes on Google
         ↓
Google redirects to /api/auth/callback/google?code=...
         ↓
NextAuth exchanges code for access token
         ↓
Fetches user profile from Google
         ↓
signIn() callback in auth.ts runs
```

**signIn() callback execution (auth.ts):**
```typescript
async signIn({ user, account, profile }) {
  // 1. Check if user is allowed (database query)
  const access = await getUserAccess(user.email);
  
  // 2. If not allowed, return false → user sees error
  if (!access?.isAllowed) return false;
  
  // 3. Upsert user to database (track sign-ins)
  const dbUser = await upsertUser({ email, name, ... });
  
  // 4. CRITICAL: Update user.id to database UUID
  user.id = dbUser.id;
  
  // 5. Return true to allow sign-in
  return true;
}
```

**Key Point:** The `user` object passed to subsequent callbacks contains the modified `user.id` from this callback.

### Phase 3: JWT Creation

```
signIn() returns true
         ↓
jwt() callback in auth.ts runs
         ↓
JWT token is created and encrypted
         ↓
Set as httpOnly cookie: next-auth.session-token
```

**jwt() callback execution (auth.ts):**
```typescript
async jwt({ token, user, trigger, session }) {
  // Only runs on sign-in when 'user' is present
  if (user) {
    // 1. user.id is already the database UUID (set in signIn callback)
    token.userId = user.id;
    token.picture = user.image;
    
    // 2. For One Tap, we need to upsert here
    if (needsUpsert) {
      const dbUser = await upsertUser(...);
      token.userId = dbUser.id;
    }
  }
  
  // token.userId persists across all future requests
  return token;
}
```

**Critical Understanding:**
- This callback runs ONCE on sign-in (when `user` is present)
- It runs on EVERY subsequent request (when `user` is undefined)
- The `token` object persists between calls - JWT is stateless but encrypted
- Whatever you put in `token` stays there until session expires

**JWT Structure:**
```json
{
  "sub": "google-oauth-id",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://...",
  "userId": "cc49ccba-eddf-47a3-a1f0-1b4ca26b9bbf",  // Our custom field
  "iat": 1234567890,
  "exp": 1234657890
}
```

### Phase 4: Session Creation

```
JWT cookie set
         ↓
User redirected to callbackUrl (/generate)
         ↓
Page calls auth() or useSession()
         ↓
session() callback in auth.ts runs
         ↓
Session object returned to page
```

**session() callback execution (auth.ts):**
```typescript
async session({ session, token }) {
  // Runs on EVERY call to auth() or useSession()
  // Token is automatically decrypted by NextAuth
  
  if (session.user) {
    // Expose userId from JWT to session
    session.user.id = token.userId as string;
    session.user.image = token.picture as string;
  }
  
  return session;
}
```

**Session Object Structure:**
```typescript
{
  user: {
    id: "cc49ccba-eddf-47a3-a1f0-1b4ca26b9bbf",  // From JWT token
    email: "user@example.com",
    name: "User Name",
    image: "https://..."
  },
  expires: "2024-04-01T00:00:00.000Z"
}
```

---

## Middleware Flow: Request Authorization

### Every Request Path

```
User navigates to /generate
         ↓
proxy.ts (middleware) intercepts request
         ↓
Calls auth() from exported auth instance
         ↓
NextAuth decrypts JWT cookie internally
         ↓
Creates auth object { user: {...} }
         ↓
Passes to authorized() callback in auth.config.ts
         ↓
authorized() returns true/false/Response.redirect()
         ↓
Request continues or redirects
```

**Critical Middleware Flow:**

```typescript
// proxy.ts
import { auth } from "@/auth";  // MUST use same instance

export { auth as proxy };  // Export as 'proxy'

// When request hits middleware:
// 1. NextAuth automatically decrypts JWT cookie
// 2. Creates auth object from JWT payload
// 3. Calls authorized() callback
```

**authorized() callback (auth.config.ts):**
```typescript
authorized({ auth, request }) {
  // auth = { user: { email, name, ... } } or null
  // request = NextRequest object with URL, headers, etc.
  
  const isLoggedIn = !!auth?.user;
  const pathname = request.nextUrl.pathname;
  
  if (isLoggedIn && pathname === "/") {
    // Redirect logged-in users away from login page
    return Response.redirect(new URL("/generate", request.nextUrl));
  }
  
  if (!isLoggedIn && pathname !== "/") {
    // Redirect logged-out users to login
    return Response.redirect(new URL("/", request.nextUrl));
  }
  
  return true;  // Allow request
}
```

---

## How Information Flows

### Data Flow: Sign-In to Authenticated Request

```
1. Google OAuth
   ↓ (profile data)
2. signIn() callback
   - Validates access (DB query)
   - Upserts user (DB write)
   - Returns user with db.id
   ↓ (user object)
3. jwt() callback
   - Stores user.id in JWT as token.userId
   - JWT encrypted and set as cookie
   ↓ (encrypted JWT cookie)
4. User navigates to /generate
   ↓
5. Middleware (proxy.ts)
   - Decrypts JWT
   - Checks auth?.user exists
   - Calls authorized()
   - Allows request
   ↓
6. Page calls auth()
   ↓
7. session() callback
   - Decrypts JWT
   - Extracts token.userId
   - Returns session.user.id
   ↓
8. Page uses session.user.id
   - Queries user's data from DB
   - Renders personalized content
```

### Key Data Transformations

| Stage | Data Source | Data Format | Available Info |
|-------|-------------|-------------|----------------|
| Google OAuth | External API | OAuth profile | email, name, picture, sub |
| signIn() | Database | User object | + database UUID, access role |
| jwt() | In-memory | JWT payload | email, name, picture, userId (UUID) |
| Cookie | Browser | Encrypted string | (opaque to client) |
| Middleware | Decrypted JWT | auth object | email, name, picture (NO userId) |
| session() | Decrypted JWT | Session object | + userId from token |
| Page/API | Session | Session object | Full user data for queries |

---

## Your Specific Issue: Root Cause Analysis

### The Problem

**Symptom:** After successful Google sign-in, user stays on `/` and clicking "Generate" does nothing. Middleware logs show `isLoggedIn: false` even though JWT callbacks show valid session.

### Root Cause

**proxy.ts was creating a separate NextAuth instance:**

```typescript
// WRONG - Creates isolated NextAuth instance
import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);  // ❌ New instance
export { auth as proxy };
```

**Why this breaks authentication:**

1. **Two separate NextAuth instances:**
   - `auth.ts` exports one instance (used by pages/API routes)
   - `proxy.ts` creates another instance (used by middleware)

2. **Different configurations:**
   - `auth.ts` has full config: providers, JWT callbacks, session callbacks
   - `proxy.ts` only has `authConfig`: no providers, minimal callbacks

3. **Cookie/JWT mismatch:**
   - User signs in through `auth.ts` instance
   - JWT cookie is encrypted with `auth.ts` instance's secret
   - `proxy.ts` instance tries to decrypt with different internal state
   - Decryption fails or returns empty auth object
   - Middleware sees `auth = null` → `isLoggedIn = false`

4. **Session exists but middleware can't see it:**
   - Pages calling `auth()` from `auth.ts` → sees valid session
   - Middleware calling `auth()` from `proxy.ts` → sees no session
   - User appears "logged in" on pages but "logged out" to middleware

### The Fix

**Import the same auth instance:**

```typescript
// CORRECT - Uses same instance
import { auth } from "@/auth";  // ✅ Same instance

export { auth as proxy };
```

**Why this works:**

1. **Single source of truth:**
   - Both pages and middleware use the same NextAuth instance
   - Same encryption keys, same JWT handling

2. **Consistent session state:**
   - JWT encrypted by `auth.ts` during sign-in
   - Same instance in `proxy.ts` can decrypt it
   - Middleware sees valid `auth.user` object

3. **Proper callback execution:**
   - jwt() callback runs and sets token.userId
   - Middleware auth() decrypts same token
   - authorized() receives correct auth object with user data

---

## Edge Runtime Constraints

### Why We Need Two Files (auth.ts + auth.config.ts)

**Edge Runtime Limitations:**
- No Node.js APIs (fs, crypto.subtle differences, etc.)
- No database connections (Postgres, MySQL drivers)
- Limited package compatibility
- Fast, globally distributed, but constrained

**NextAuth's Solution:**
- `auth.ts` = Full config for server routes (Node.js runtime)
- `auth.config.ts` = Minimal config for middleware (Edge runtime)
- `proxy.ts` = Imports auth from `auth.ts` but runs `authorized()` from config

**How NextAuth handles this:**

```typescript
// auth.ts (Node.js runtime)
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,  // Spreads edge-compatible config
  session: { strategy: "jwt" },
  providers: [Google(...)],  // Node.js only
  callbacks: {
    async signIn() { /* DB queries OK */ },
    async jwt() { /* DB queries OK */ },
  }
});

// proxy.ts (Edge runtime)
import { auth } from "@/auth";  // Gets the function, not full config
export { auth as proxy };

// NextAuth internally:
// - When auth() called in middleware → uses authConfig.authorized()
// - JWT decryption happens in NextAuth's core (works in Edge)
// - Only authorized() callback runs in Edge
```

---

## Security Considerations

### JWT vs Database Sessions

**Your app uses JWT strategy:**

**Advantages:**
- No database query on every request
- Scales horizontally (stateless)
- Works in edge/serverless environments

**Trade-offs:**
- Can't revoke sessions immediately (must wait for expiry)
- Session data is in cookie (size limited to ~4KB)
- Must be careful what data goes in JWT

### What's Stored in JWT

**Safe to store:**
- User ID (UUID)
- Email
- Name
- Profile picture URL
- Role (after verification)

**Never store:**
- Passwords
- API keys
- Sensitive personal data
- Large data structures

### Cookie Security

NextAuth sets these cookie attributes:
- `httpOnly: true` - JavaScript can't access (XSS protection)
- `sameSite: "lax"` - CSRF protection
- `secure: true` (production) - HTTPS only
- `path: "/"` - Available to all routes

---

## Debugging Tips

### Check Middleware Auth State

```typescript
authorized({ auth, request }) {
  console.log("Middleware auth:", {
    isLoggedIn: !!auth?.user,
    email: auth?.user?.email,
    pathname: request.nextUrl.pathname,
  });
  // ...
}
```

### Check JWT Callback

```typescript
async jwt({ token, user }) {
  console.log("JWT callback:", {
    hasUser: !!user,
    userId: token.userId,
    email: token.email,
  });
  // ...
}
```

### Check Session Callback

```typescript
async session({ session, token }) {
  console.log("Session callback:", {
    tokenUserId: token.userId,
    sessionUserId: session.user?.id,
  });
  // ...
}
```

### Common Issues

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Middleware shows user logged out | Separate NextAuth instances | Import auth from auth.ts |
| Session has no userId | jwt() callback not setting token.userId | Add userId to token on sign-in |
| Redirect loop | authorized() logic error | Check redirect conditions |
| Session exists on page but not middleware | Cookie domain mismatch | Check NEXTAUTH_URL env var |

---

## Best Practices

### 1. **Single Auth Instance**
Always import `auth` from the same source:
```typescript
// ✅ Good
import { auth } from "@/auth";

// ❌ Bad
const { auth } = NextAuth(config);
```

### 2. **Minimal Middleware Logic**
Keep `authorized()` fast and simple:
- No database queries
- No external API calls
- Simple boolean checks only

### 3. **Store IDs, Not Data**
JWT should contain identifiers, not full objects:
```typescript
// ✅ Good
token.userId = dbUser.id;

// ❌ Bad
token.user = { id, email, name, preferences: {...}, settings: {...} };
```

### 4. **Database Queries in Pages/APIs**
Fetch user data where you have full Node.js access:
```typescript
// app/generate/page.tsx
const session = await auth();
const userData = await db.query.users.findFirst({
  where: eq(users.id, session.user.id)
});
```

### 5. **Type Safety**
Extend NextAuth types for custom fields:
```typescript
// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string;  // Add custom field
      email: string;
      name: string;
    }
  }
}
```

---

## Conclusion

NextAuth.js v5 architecture separates concerns between full server-side logic (auth.ts) and lightweight edge-compatible authorization (auth.config.ts). The key to successful implementation is:

1. Understanding that middleware runs in a constrained Edge runtime
2. Using a single NextAuth instance across your entire application
3. Storing minimal data in JWTs (IDs, not full objects)
4. Performing authorization checks in middleware, data fetching in pages

**Your specific bug** was caused by middleware using a separate NextAuth instance, causing JWT decryption mismatches. The fix was simple: import the same `auth` instance everywhere.

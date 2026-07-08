# Fawn Docs

Learning-oriented docs — each file explains how one part of the app works and *why* it's
built that way. Code is the source of truth; these explain the shape of it.

| Doc | What it covers |
|---|---|
| [architecture.md](architecture.md) | Repo structure, what happens on a request, where logic lives |
| [auth.md](auth.md) | Sign-in (Google OAuth + One Tap), JWT sessions, the access/approval layer |
| [database.md](database.md) | Supabase + Drizzle: schema, inferred types, pooling, migrations |
| [generation-pipeline.md](generation-pipeline.md) | Form → API → prompt building → Bedrock → history |
| [design-system.md](design-system.md) | Theme tokens, typography, the two-layer component system |
| [nextauth-architecture.md](nextauth-architecture.md) | Deep dive: generic NextAuth v5 mechanics (JWT encryption, callback order, proxy) |
| [auth-whitelist-current-flow.md](auth-whitelist-current-flow.md) | **Historical** — the pre-July-2026 whitelist model |
| [plans/](plans/) | Design documents (decisions + rationale) written before implementing |

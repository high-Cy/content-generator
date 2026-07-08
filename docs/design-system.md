# Design System — Theme, Typography, Two-Layer Components

Everything visual flows from one file: `lib/theme.ts`. Components never hardcode colours,
fonts, or spacing — they consume the theme or the styled shims built on it.

## Tokens

```ts
export const PALETTE = {
  red:        "#df2935",   // primary CTA, active nav, errors — use sparingly
  sage:       "#86ba90",   // success, secondary
  cream:      "#f4f1e8",   // page background (warm parchment)
  terracotta: "#dfa06e",   // eyebrows, warnings, tertiary accents
  brown:      "#412722",   // ALL text + borders (usually via alpha())
  white:      "#ffffff",
  offWhite:   "#faf8f3",   // card surfaces on cream
};
```

`PALETTE` is exported separately from the theme so any file can grab a raw hex without
importing MUI. The rule: **never a hex literal in a component** — always `PALETTE.x` or
`alpha(PALETTE.x, n)`. Alpha-of-brown does a lot of work: borders `alpha(brown, .1–.2)`,
muted text `.5–.65`, hover washes `.05`.

The MUI theme maps these to semantic slots (`primary` = red, `success` = sage, `warning` =
terracotta, `background` = cream/offWhite) so standard MUI components pick them up
automatically. Global `shape.borderRadius: 8`; buttons/inputs override per-component.

## Typography

Three families, loaded in `app/layout.tsx` via `next/font/google` (self-hosted, no layout
shift):

| Font | Used for |
|---|---|
| **Syne** | h1–h4 headings + the logo. Geometric display face; tight letter-spacing, `clamp()` responsive sizes. |
| **DM Sans** | Everything else — body, buttons, inputs, captions. |
| **IBM Plex Mono** | Code blocks only (`Mono`, `CodeBlock` shims). |

Uppercase micro-labels (the "eyebrow" pattern) come from `caption`/`h5` variants: small,
letter-spaced, `alpha(brown, .5)`.

## Component overrides — restyle MUI once, globally

The bulk of `theme.ts` is `components` overrides. Instead of styling every `<TextField>`
usage, the theme restyles MUI itself: buttons (red fill → brown on hover), text fields
(static label pinned *above* the input rather than MUI's floating label — see the
`MuiTextField` override), chips, alerts, menus, scrollbars, `::selection`. Consequence:
plain MUI components dropped anywhere already look like Fawn.

## The two-layer component system

**Layer 1 — `components/styled/`** (import from `@/components/styled`): ~35 zero-logic
primitives made with `styled()`. They encode *layout intent as names* so JSX reads like a
page outline and `sx` soup doesn't accumulate:

- layout: `PageWrapper` `PageContainer` `NarrowContainer` `Section` `PageHeader` `Panel`
  `AccentPanel` `Row` `Col` `SpacedRow` `Centred` `Rule` `FieldGroup` `FieldSet`
  `TwoColGrid` `StickyFooter` `PlainButton`
- typography: `Eyebrow` `RedEyebrow` `PageTitle` `SectionTitle` `CardTitle` `BodyText`
  `MutedText` `Caption` `Mono` `CodeBlock`
- surfaces: `Card` `ClickableCard` `AccentCard` `ListCard` `Well` `Callout` `InlineTag` `RedDot`

**Layer 2 — `components/ui/`** (import from `@/components/ui`): interactive wrappers with
real props APIs — `AppButton` (variant/loading), `AppInput`, `AppSelect`, `AppCard`,
`AppToast` + `useToast`, `SectionLabel`, `StatusChip`.

Styling hierarchy when building a page:

1. Reach for a shim (`<SpacedRow>` not `<Box sx={{display:"flex",justifyContent:"space-between"}}>`)
2. `sx` only for one-off spacing tweaks on an existing shim (`<Card sx={{ mt: 3 }}>`)
3. Colour values only via `PALETTE` / `alpha()`

Both layers are consumed through **barrel imports only** (`@/components/styled`,
`@/components/ui`) — never deep paths.

## SSR plumbing gotchas

- Every file in `components/styled/` starts with `"use client"` — `styled()` uses Emotion,
  a client-side runtime. Server components can still *import and render* them; the
  directive just puts the shims themselves in the client bundle.
- `ThemeRegistry.tsx` is the required MUI-in-App-Router boilerplate: it creates an Emotion
  cache per request and flushes the generated CSS into the server-rendered HTML
  (`useServerInsertedHTML`), so styles arrive with the markup instead of flashing in after
  hydration.

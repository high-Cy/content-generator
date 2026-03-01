"use client";

import { styled, alpha } from "@mui/material/styles";
import { PALETTE } from "@/lib/theme";

// ─── Eyebrows ──────────────────────────────────────────────────────────────────

export const Eyebrow = styled("p")({
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.7rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: PALETTE.terracotta,
  fontWeight: 700,
  margin: 0,
});

export const RedEyebrow = styled(Eyebrow)({
  color: PALETTE.red,
});

// ─── Headings ─────────────────────────────────────────────────────────────────

export const PageTitle = styled("h1")({
  fontFamily: '"Syne", sans-serif',
  fontWeight: 700,
  fontSize: "clamp(2rem, 4vw, 3rem)",
  lineHeight: 1.05,
  letterSpacing: "-0.03em",
  color: PALETTE.brown,
  margin: 0,
});

export const SectionTitle = styled("h2")({
  fontFamily: '"Syne", sans-serif',
  fontWeight: 700,
  fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
  lineHeight: 1.1,
  letterSpacing: "-0.025em",
  color: PALETTE.brown,
  margin: 0,
});

export const CardTitle = styled("h3")({
  fontFamily: '"Syne", sans-serif',
  fontWeight: 600,
  fontSize: "1.05rem",
  lineHeight: 1.25,
  letterSpacing: "-0.01em",
  color: PALETTE.brown,
  margin: 0,
});

// ─── Body ─────────────────────────────────────────────────────────────────────

export const BodyText = styled("p")({
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.95rem",
  lineHeight: 1.65,
  color: PALETTE.brown,
  margin: 0,
});

export const MutedText = styled("p")({
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.9rem",
  lineHeight: 1.65,
  color: alpha(PALETTE.brown, 0.55),
  margin: 0,
});

export const Caption = styled("span")({
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.72rem",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  fontWeight: 600,
  color: alpha(PALETTE.brown, 0.5),
});

// ─── Code — IBM Plex Mono intentionally kept here ─────────────────────────────

export const Mono = styled("code")({
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: "0.85em",
  backgroundColor: alpha(PALETTE.brown, 0.06),
  padding: "2px 6px",
  borderRadius: 4,
  border: `1px solid ${alpha(PALETTE.brown, 0.1)}`,
});

export const CodeBlock = styled("pre")({
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: "0.82rem",
  backgroundColor: alpha(PALETTE.brown, 0.04),
  border: `1px solid ${alpha(PALETTE.brown, 0.1)}`,
  borderRadius: 8,
  padding: "16px",
  overflowX: "auto",
  lineHeight: 1.6,
  color: PALETTE.brown,
  margin: 0,
});

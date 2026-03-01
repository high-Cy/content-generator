"use client";

import { styled, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { PALETTE } from "@/lib/theme";

// ─── Cards ────────────────────────────────────────────────────────────────────

export const Card = styled(Box)({
  backgroundColor: PALETTE.white,
  borderRadius: 14,
  padding: 24,
  boxShadow: `0 1px 2px ${alpha(PALETTE.brown, 0.05)}, 0 4px 16px ${alpha(PALETTE.brown, 0.07)}`,
});

export const ClickableCard = styled(Card)({
  cursor: "pointer",
  transition: "box-shadow 0.15s ease, transform 0.15s ease",
  "&:hover": {
    boxShadow: `0 2px 8px ${alpha(PALETTE.brown, 0.08)}, 0 8px 24px ${alpha(PALETTE.brown, 0.1)}`,
    transform: "translateY(-1px)",
  },
});

export const AccentCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "accent",
})<{ accent?: "red" | "sage" | "terracotta" }>(({ accent = "red" }) => ({
  borderLeft: `3px solid ${PALETTE[accent]}`,
}));

export const ListCard = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: "12px 16px",
  backgroundColor: PALETTE.white,
  borderRadius: 10,
  cursor: "pointer",
  boxShadow: `0 1px 2px ${alpha(PALETTE.brown, 0.04)}, 0 2px 8px ${alpha(PALETTE.brown, 0.06)}`,
  transition: "box-shadow 0.15s ease",
  "&:hover": {
    boxShadow: `0 2px 6px ${alpha(PALETTE.brown, 0.08)}, 0 6px 20px ${alpha(PALETTE.brown, 0.09)}`,
  },
});

// ─── Containers ───────────────────────────────────────────────────────────────

export const Well = styled(Box)({
  backgroundColor: alpha(PALETTE.brown, 0.04),
  borderRadius: 10,
  padding: 20,
  boxShadow: `inset 0 1px 3px ${alpha(PALETTE.brown, 0.06)}`,
});

type CalloutVariant = "info" | "success" | "warning" | "error";

const calloutColors: Record<CalloutVariant, { bg: string; border: string }> = {
  info:    { bg: alpha(PALETTE.terracotta, 0.08), border: alpha(PALETTE.terracotta, 0.2) },
  success: { bg: alpha(PALETTE.sage, 0.1),        border: alpha(PALETTE.sage, 0.3) },
  warning: { bg: alpha(PALETTE.terracotta, 0.12), border: alpha(PALETTE.terracotta, 0.3) },
  error:   { bg: alpha(PALETTE.red, 0.06),        border: alpha(PALETTE.red, 0.2) },
};

export const Callout = styled(Box, {
  shouldForwardProp: (prop) => prop !== "variant",
})<{ variant?: CalloutVariant }>(({ variant = "info" }) => ({
  backgroundColor: calloutColors[variant].bg,
  border: `1px solid ${calloutColors[variant].border}`,
  padding: 16,
}));

// ─── Badges ───────────────────────────────────────────────────────────────────

export const InlineTag = styled(Box)({
  display: "inline-block",
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.68rem",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  fontWeight: 600,
  color: PALETTE.brown,
  backgroundColor: alpha(PALETTE.brown, 0.08),
  padding: "2px 8px",
  border: `1px solid ${alpha(PALETTE.brown, 0.12)}`,
});

export const RedDot = styled(Box)({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: PALETTE.red,
  flexShrink: 0,
});

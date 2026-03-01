"use client";

import { styled, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import { PALETTE } from "@/lib/theme";

// ─── Page Structure ────────────────────────────────────────────────────────────

export const PageWrapper = styled(Box)({
  minHeight: "calc(100vh - 60px)",
  backgroundColor: PALETTE.cream,
});

export const PageContainer = styled(Container)({}) as typeof Container;
(PageContainer as typeof Container & { defaultProps?: object }).defaultProps = { maxWidth: "lg" };

export const NarrowContainer = styled(Container)({}) as typeof Container;
(NarrowContainer as typeof Container & { defaultProps?: object }).defaultProps = { maxWidth: "sm" };

export const Section = styled(Box)({
  paddingTop: 48,
  paddingBottom: 48,
});

export const PageHeader = styled(Box)({
  paddingBottom: 24,
  borderBottom: `1px solid ${alpha(PALETTE.brown, 0.12)}`,
  marginBottom: 40,
});

// ─── Panels ────────────────────────────────────────────────────────────────────

export const Panel = styled(Box)({
  backgroundColor: PALETTE.white,
  borderRadius: 14,
  padding: 24,
  boxShadow: `0 1px 2px ${alpha(PALETTE.brown, 0.05)}, 0 4px 16px ${alpha(PALETTE.brown, 0.07)}`,
});

export const AccentPanel = styled(Box, {
  shouldForwardProp: (prop) => prop !== "accent",
})<{ accent?: "red" | "sage" | "terracotta" }>(({ accent = "red" }) => ({
  backgroundColor: PALETTE.white,
  borderRadius: 14,
  borderLeft: `3px solid ${PALETTE[accent]}`,
  padding: 24,
  boxShadow: `0 1px 2px ${alpha(PALETTE.brown, 0.05)}, 0 4px 16px ${alpha(PALETTE.brown, 0.07)}`,
}));

// ─── Flex Helpers ──────────────────────────────────────────────────────────────

export const Row = styled(Box)({
  display: "flex",
  alignItems: "center",
});

export const Col = styled(Box)({
  display: "flex",
  flexDirection: "column",
});

export const SpacedRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export const Centred = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

// ─── Misc ──────────────────────────────────────────────────────────────────────

export const Rule = styled(Divider)({
  borderColor: alpha(PALETTE.brown, 0.12),
});

export const FieldGroup = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 8,
});

export const FieldSet = styled(Box)({
  paddingBottom: 24,
  marginBottom: 24,
  borderBottom: `1px solid ${alpha(PALETTE.brown, 0.1)}`,
});

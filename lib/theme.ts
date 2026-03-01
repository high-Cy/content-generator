import { createTheme, alpha } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

// ─── Design Tokens ────────────────────────────────────────────────────────────
// Single source of truth. Import PALETTE anywhere you need raw hex values.
// Use the MUI theme for components; use PALETTE for CSS-in-JS one-offs.

export const PALETTE = {
  red: "#df2935",       // Primary accent — CTAs, active states, alerts
  sage: "#86ba90",      // Secondary — success states, secondary actions
  cream: "#f5f3bb",     // Background warmth — page bg, card surfaces
  terracotta: "#dfa06e",// Tertiary — highlights, tags, decorative
  brown: "#412722",     // Text & structure — headings, borders, icons
  white: "#ffffff",
  offWhite: "#fafaf7",  // Slightly warm white for cards on cream bg
} as const;

// ─── Semantic colour aliases ──────────────────────────────────────────────────
// Use these names in component code, not hex values. Makes theme changes easy.
const semantic = {
  primary: PALETTE.red,
  secondary: PALETTE.sage,
  background: PALETTE.cream,
  surface: PALETTE.offWhite,
  text: PALETTE.brown,
  accent: PALETTE.terracotta,
};

// ─── Typography ───────────────────────────────────────────────────────────────
// Playfair Display: editorial warmth for headings
// IBM Plex Mono: technical precision for body/labels/code
// Load both in layout.tsx via next/font/google
const typography: ThemeOptions["typography"] = {
  fontFamily: '"IBM Plex Mono", monospace',
  h1: {
    fontFamily: '"Playfair Display", serif',
    fontWeight: 700,
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    color: PALETTE.brown,
  },
  h2: {
    fontFamily: '"Playfair Display", serif',
    fontWeight: 700,
    fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
    color: PALETTE.brown,
  },
  h3: {
    fontFamily: '"Playfair Display", serif',
    fontWeight: 600,
    fontSize: "clamp(1.3rem, 2vw, 1.8rem)",
    lineHeight: 1.3,
    color: PALETTE.brown,
  },
  h4: {
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 600,
    fontSize: "1.1rem",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    color: PALETTE.brown,
  },
  h5: {
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 600,
    fontSize: "0.95rem",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: PALETTE.brown,
  },
  body1: {
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: "0.9rem",
    lineHeight: 1.7,
    color: PALETTE.brown,
  },
  body2: {
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: "0.8rem",
    lineHeight: 1.6,
    color: alpha(PALETTE.brown, 0.65),
  },
  caption: {
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: "0.72rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: alpha(PALETTE.brown, 0.5),
  },
  button: {
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 600,
    fontSize: "0.82rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
};

// ─── MUI Component Overrides ─────────────────────────────────────────────────
const components: ThemeOptions["components"] = {
  MuiCssBaseline: {
    styleOverrides: {
      "*": { boxSizing: "border-box" },
      body: {
        backgroundColor: PALETTE.cream,
        color: PALETTE.brown,
        minHeight: "100vh",
      },
      "::selection": {
        backgroundColor: alpha(PALETTE.red, 0.15),
        color: PALETTE.brown,
      },
      // Custom scrollbar
      "::-webkit-scrollbar": { width: "6px" },
      "::-webkit-scrollbar-track": { background: "transparent" },
      "::-webkit-scrollbar-thumb": {
        background: alpha(PALETTE.brown, 0.2),
        borderRadius: "3px",
      },
      "::-webkit-scrollbar-thumb:hover": {
        background: alpha(PALETTE.brown, 0.4),
      },
    },
  },

  MuiButton: {
    defaultProps: { disableElevation: true, disableRipple: false },
    styleOverrides: {
      root: {
        borderRadius: 0, // Sharp corners — editorial, not bubbly
        padding: "10px 24px",
        transition: "all 0.15s ease",
        position: "relative",
        overflow: "hidden",
      },
      containedPrimary: {
        backgroundColor: PALETTE.red,
        color: PALETTE.white,
        border: `1px solid ${PALETTE.red}`,
        "&:hover": {
          backgroundColor: PALETTE.brown,
          borderColor: PALETTE.brown,
        },
        "&:disabled": {
          backgroundColor: alpha(PALETTE.brown, 0.1),
          color: alpha(PALETTE.brown, 0.35),
          border: `1px solid transparent`,
        },
      },
      outlinedPrimary: {
        backgroundColor: "transparent",
        color: PALETTE.brown,
        border: `1px solid ${PALETTE.brown}`,
        "&:hover": {
          backgroundColor: PALETTE.brown,
          color: PALETTE.cream,
        },
      },
      outlinedSecondary: {
        backgroundColor: "transparent",
        color: PALETTE.brown,
        border: `1px solid ${alpha(PALETTE.brown, 0.25)}`,
        "&:hover": {
          backgroundColor: alpha(PALETTE.brown, 0.05),
          borderColor: PALETTE.brown,
        },
      },
      textPrimary: {
        color: PALETTE.brown,
        "&:hover": {
          backgroundColor: alpha(PALETTE.brown, 0.06),
        },
      },
      sizeLarge: { padding: "13px 32px", fontSize: "0.88rem" },
      sizeSmall: { padding: "6px 14px", fontSize: "0.75rem" },
    },
  },

  MuiTextField: {
    defaultProps: { variant: "outlined" },
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: 0,
          backgroundColor: PALETTE.white,
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: "0.88rem",
          "& fieldset": {
            borderColor: alpha(PALETTE.brown, 0.25),
            transition: "border-color 0.15s ease",
          },
          "&:hover fieldset": { borderColor: alpha(PALETTE.brown, 0.5) },
          "&.Mui-focused fieldset": {
            borderColor: PALETTE.brown,
            borderWidth: "1px",
          },
          "&.Mui-error fieldset": { borderColor: PALETTE.red },
        },
        "& .MuiInputLabel-root": {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: "0.82rem",
          letterSpacing: "0.04em",
          color: alpha(PALETTE.brown, 0.55),
          "&.Mui-focused": { color: PALETTE.brown },
          "&.Mui-error": { color: PALETTE.red },
        },
        "& .MuiFormHelperText-root": {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: "0.72rem",
          marginLeft: 0,
        },
      },
    },
  },

  MuiSelect: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: "0.88rem",
        backgroundColor: PALETTE.white,
      },
    },
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: "0.72rem",
        letterSpacing: "0.04em",
        height: 26,
      },
      colorDefault: {
        backgroundColor: alpha(PALETTE.brown, 0.08),
        color: PALETTE.brown,
      },
      colorPrimary: {
        backgroundColor: alpha(PALETTE.red, 0.1),
        color: PALETTE.red,
        border: `1px solid ${alpha(PALETTE.red, 0.2)}`,
      },
      colorSuccess: {
        backgroundColor: alpha(PALETTE.sage, 0.2),
        color: PALETTE.brown,
        border: `1px solid ${alpha(PALETTE.sage, 0.4)}`,
      },
    },
  },

  MuiDivider: {
    styleOverrides: {
      root: { borderColor: alpha(PALETTE.brown, 0.12) },
    },
  },

  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        backgroundImage: "none",
      },
      elevation1: {
        boxShadow: `0 1px 0 ${alpha(PALETTE.brown, 0.08)}, 0 4px 16px ${alpha(PALETTE.brown, 0.06)}`,
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        border: `1px solid ${alpha(PALETTE.brown, 0.1)}`,
        boxShadow: "none",
        backgroundColor: PALETTE.offWhite,
      },
    },
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: PALETTE.brown,
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: "0.72rem",
        letterSpacing: "0.02em",
        borderRadius: 0,
        padding: "6px 10px",
      },
    },
  },

  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: "0.82rem",
        border: "1px solid",
      },
      standardError: {
        backgroundColor: alpha(PALETTE.red, 0.06),
        borderColor: alpha(PALETTE.red, 0.2),
        color: PALETTE.brown,
        "& .MuiAlert-icon": { color: PALETTE.red },
      },
      standardSuccess: {
        backgroundColor: alpha(PALETTE.sage, 0.12),
        borderColor: alpha(PALETTE.sage, 0.3),
        color: PALETTE.brown,
        "& .MuiAlert-icon": { color: PALETTE.sage },
      },
      standardWarning: {
        backgroundColor: alpha(PALETTE.terracotta, 0.1),
        borderColor: alpha(PALETTE.terracotta, 0.3),
        color: PALETTE.brown,
        "& .MuiAlert-icon": { color: PALETTE.terracotta },
      },
    },
  },

  MuiSnackbar: {
    defaultProps: {
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
    },
  },

  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        backgroundColor: alpha(PALETTE.brown, 0.1),
        height: 2,
      },
      barColorPrimary: { backgroundColor: PALETTE.red },
    },
  },

  MuiSkeleton: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        backgroundColor: alpha(PALETTE.brown, 0.08),
      },
    },
  },

  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: PALETTE.cream,
        color: PALETTE.brown,
        boxShadow: "none",
        borderBottom: `1px solid ${alpha(PALETTE.brown, 0.1)}`,
      },
    },
  },

  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: PALETTE.offWhite,
        borderRight: `1px solid ${alpha(PALETTE.brown, 0.1)}`,
      },
    },
  },

  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        fontFamily: '"IBM Plex Mono", monospace',
        "&.Mui-selected": {
          backgroundColor: alpha(PALETTE.red, 0.08),
          borderLeft: `2px solid ${PALETTE.red}`,
          "&:hover": { backgroundColor: alpha(PALETTE.red, 0.12) },
        },
        "&:hover": { backgroundColor: alpha(PALETTE.brown, 0.05) },
      },
    },
  },

  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
        border: `1px solid ${alpha(PALETTE.brown, 0.12)}`,
        boxShadow: `0 8px 24px ${alpha(PALETTE.brown, 0.12)}`,
        backgroundColor: PALETTE.white,
      },
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: {
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: "0.82rem",
        "&:hover": { backgroundColor: alpha(PALETTE.brown, 0.05) },
        "&.Mui-selected": {
          backgroundColor: alpha(PALETTE.red, 0.06),
          "&:hover": { backgroundColor: alpha(PALETTE.red, 0.1) },
        },
      },
    },
  },
};

// ─── Final Theme ──────────────────────────────────────────────────────────────
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: semantic.primary,
      contrastText: PALETTE.white,
    },
    secondary: {
      main: semantic.secondary,
      contrastText: PALETTE.brown,
    },
    background: {
      default: semantic.background,
      paper: semantic.surface,
    },
    text: {
      primary: PALETTE.brown,
      secondary: alpha(PALETTE.brown, 0.65),
      disabled: alpha(PALETTE.brown, 0.35),
    },
    error: { main: PALETTE.red },
    success: { main: PALETTE.sage },
    warning: { main: PALETTE.terracotta },
    divider: alpha(PALETTE.brown, 0.12),
  },
  typography,
  components,
  shape: { borderRadius: 0 }, // Global: sharp corners
  spacing: 8,
});

export default theme;

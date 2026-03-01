import { createTheme, alpha } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

// ─── Design Tokens ────────────────────────────────────────────────────────────

export const PALETTE = {
  red: "#df2935",
  sage: "#86ba90",
  cream: "#f4f1e8",       // Warm parchment — less saturated than before
  terracotta: "#dfa06e",
  brown: "#412722",
  white: "#ffffff",
  offWhite: "#faf8f3",
} as const;

// ─── Semantic colour aliases ──────────────────────────────────────────────────
const semantic = {
  primary: PALETTE.red,
  secondary: PALETTE.sage,
  background: PALETTE.cream,
  surface: PALETTE.offWhite,
  text: PALETTE.brown,
  accent: PALETTE.terracotta,
};

// ─── Typography ───────────────────────────────────────────────────────────────
// Syne: modern geometric display for headings
// DM Sans: clean, readable sans for body and UI
// IBM Plex Mono: reserved for code blocks only
const typography: ThemeOptions["typography"] = {
  fontFamily: '"DM Sans", sans-serif',
  h1: {
    fontFamily: '"Syne", sans-serif',
    fontWeight: 700,
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    color: PALETTE.brown,
  },
  h2: {
    fontFamily: '"Syne", sans-serif',
    fontWeight: 700,
    fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
    lineHeight: 1.1,
    letterSpacing: "-0.025em",
    color: PALETTE.brown,
  },
  h3: {
    fontFamily: '"Syne", sans-serif',
    fontWeight: 600,
    fontSize: "clamp(1.3rem, 2vw, 1.7rem)",
    lineHeight: 1.2,
    letterSpacing: "-0.015em",
    color: PALETTE.brown,
  },
  h4: {
    fontFamily: '"Syne", sans-serif',
    fontWeight: 600,
    fontSize: "1.1rem",
    letterSpacing: "-0.01em",
    color: PALETTE.brown,
  },
  h5: {
    fontFamily: '"DM Sans", sans-serif',
    fontWeight: 600,
    fontSize: "0.9rem",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    color: PALETTE.brown,
  },
  body1: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: "0.95rem",
    lineHeight: 1.65,
    color: PALETTE.brown,
  },
  body2: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: "0.85rem",
    lineHeight: 1.6,
    color: alpha(PALETTE.brown, 0.65),
  },
  caption: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: "0.75rem",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: alpha(PALETTE.brown, 0.5),
  },
  button: {
    fontFamily: '"DM Sans", sans-serif',
    fontWeight: 600,
    fontSize: "0.875rem",
    letterSpacing: "0.01em",
    textTransform: "none",  // No ALL CAPS on buttons
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
        fontFamily: '"DM Sans", sans-serif',
      },
      "::selection": {
        backgroundColor: alpha(PALETTE.red, 0.15),
        color: PALETTE.brown,
      },
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
        borderRadius: 8,
        padding: "10px 22px",
        transition: "all 0.15s ease",
        fontWeight: 600,
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
          backgroundColor: alpha(PALETTE.brown, 0.08),
          color: alpha(PALETTE.brown, 0.3),
          border: `1px solid transparent`,
        },
      },
      outlinedPrimary: {
        backgroundColor: "transparent",
        color: PALETTE.brown,
        border: `1px solid ${alpha(PALETTE.brown, 0.35)}`,
        "&:hover": {
          backgroundColor: PALETTE.brown,
          color: PALETTE.cream,
          borderColor: PALETTE.brown,
        },
      },
      outlinedSecondary: {
        backgroundColor: "transparent",
        color: PALETTE.brown,
        border: `1px solid ${alpha(PALETTE.brown, 0.2)}`,
        "&:hover": {
          backgroundColor: alpha(PALETTE.brown, 0.05),
          borderColor: alpha(PALETTE.brown, 0.4),
        },
      },
      textPrimary: {
        color: PALETTE.brown,
        "&:hover": { backgroundColor: alpha(PALETTE.brown, 0.06) },
      },
      sizeLarge: { padding: "13px 28px", fontSize: "0.95rem" },
      sizeSmall: { padding: "6px 14px", fontSize: "0.8rem", borderRadius: 6 },
    },
  },

  MuiTextField: {
    defaultProps: { variant: "outlined" },
    styleOverrides: {
      root: {
        // Static label always above the field (used with shrink:true + notched:false in AppInput)
        "& .MuiInputLabel-root": {
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 600,
          fontSize: "0.72rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: alpha(PALETTE.brown, 0.5),
          // Pin label above the input — override MUI's translate-based positioning
          position: "relative",
          transform: "none",
          marginBottom: 6,
          "&.Mui-focused": { color: PALETTE.brown },
          "&.Mui-error": { color: PALETTE.red },
        },
        "& .MuiOutlinedInput-root": {
          borderRadius: 8,
          backgroundColor: PALETTE.white,
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.9rem",
          marginTop: "0 !important", // Remove MUI's top margin reserved for floating label
          "& fieldset": {
            borderColor: alpha(PALETTE.brown, 0.18),
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            top: 0, // No notch gap needed
          },
          "&:hover fieldset": { borderColor: alpha(PALETTE.brown, 0.4) },
          "&.Mui-focused fieldset": {
            borderColor: PALETTE.brown,
            borderWidth: "1.5px",
            boxShadow: `0 0 0 3px ${alpha(PALETTE.brown, 0.08)}`,
          },
          "&.Mui-error fieldset": { borderColor: PALETTE.red },
          "& input, & textarea": {
            padding: "11px 14px",
          },
        },
        "& .MuiFormHelperText-root": {
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.78rem",
          marginLeft: 0,
          marginTop: 5,
        },
        "& .MuiInputBase-input": {
          "&::placeholder": {
            color: alpha(PALETTE.brown, 0.3),
            opacity: 1,
          },
        },
      },
    },
  },

  MuiSelect: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontFamily: '"DM Sans", sans-serif',
        fontSize: "0.9rem",
        backgroundColor: PALETTE.white,
      },
    },
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontFamily: '"DM Sans", sans-serif',
        fontSize: "0.75rem",
        fontWeight: 500,
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
      root: { borderRadius: 12, backgroundImage: "none" },
      elevation1: {
        boxShadow: `0 1px 3px ${alpha(PALETTE.brown, 0.08)}, 0 4px 16px ${alpha(PALETTE.brown, 0.06)}`,
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
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
        fontFamily: '"DM Sans", sans-serif',
        fontSize: "0.75rem",
        borderRadius: 6,
        padding: "6px 10px",
      },
    },
  },

  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontFamily: '"DM Sans", sans-serif',
        fontSize: "0.85rem",
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
      anchorOrigin: { vertical: "top", horizontal: "right" },
    },
  },

  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        backgroundColor: alpha(PALETTE.brown, 0.1),
        height: 3,
      },
      barColorPrimary: { backgroundColor: PALETTE.red },
    },
  },

  MuiSkeleton: {
    styleOverrides: {
      root: {
        borderRadius: 6,
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
        borderRadius: 8,
        fontFamily: '"DM Sans", sans-serif',
        "&.Mui-selected": {
          backgroundColor: alpha(PALETTE.red, 0.08),
          "&:hover": { backgroundColor: alpha(PALETTE.red, 0.12) },
        },
        "&:hover": { backgroundColor: alpha(PALETTE.brown, 0.05) },
      },
    },
  },

  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 10,
        border: `1px solid ${alpha(PALETTE.brown, 0.12)}`,
        boxShadow: `0 8px 24px ${alpha(PALETTE.brown, 0.12)}`,
        backgroundColor: PALETTE.white,
      },
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: {
        fontFamily: '"DM Sans", sans-serif',
        fontSize: "0.875rem",
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
  shape: { borderRadius: 8 },
  spacing: 8,
});

export default theme;

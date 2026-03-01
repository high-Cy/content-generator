import { Box, type SxProps, type Theme } from "@mui/material";
import { PALETTE } from "@/lib/theme";
import { alpha } from "@mui/material/styles";
import type { ReactNode } from "react";

interface AppCardProps {
  children: ReactNode;
  /** Add a left-border accent colour: "red" | "sage" | "terracotta" */
  accent?: "red" | "sage" | "terracotta";
  sx?: SxProps<Theme>;
  /** Click handler — makes the card interactive */
  onClick?: () => void;
}

const accentColors = {
  red: PALETTE.red,
  sage: PALETTE.sage,
  terracotta: PALETTE.terracotta,
};

const AppCard = ({ children, accent, sx, onClick }: AppCardProps) => {
  const isClickable = Boolean(onClick);

  return (
    <Box
      onClick={onClick}
      sx={{
        backgroundColor: "background.paper",
        border: `1px solid ${alpha(PALETTE.brown, 0.1)}`,
        borderLeft: accent
          ? `3px solid ${accentColors[accent]}`
          : `1px solid ${alpha(PALETTE.brown, 0.1)}`,
        p: 3,
        transition: "all 0.15s ease",
        cursor: isClickable ? "pointer" : "default",
        ...(isClickable && {
          "&:hover": {
            borderColor: PALETTE.brown,
            backgroundColor: alpha(PALETTE.cream, 0.5),
          },
        }),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export default AppCard;
import { Typography, Box, type SxProps, type Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { PALETTE } from "@/lib/theme";
import type { ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
  /** Show a short horizontal rule below the label */
  ruled?: boolean;
  sx?: SxProps<Theme>;
}

export default function SectionLabel({ children, ruled, sx }: SectionLabelProps) {
  return (
    <Box sx={sx}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: alpha(PALETTE.brown, 0.45),
          mb: ruled ? 1 : 0,
        }}
      >
        {children}
      </Typography>
      {ruled && (
        <Box
          sx={{
            height: "1px",
            backgroundColor: alpha(PALETTE.brown, 0.1),
            width: "100%",
          }}
        />
      )}
    </Box>
  );
}

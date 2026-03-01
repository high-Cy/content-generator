"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Container } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { PALETTE } from "@/lib/theme";

const SUB_NAV_LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardSubNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <Box
      sx={{
        borderBottom: `1px solid ${alpha(PALETTE.brown, 0.1)}`,
        backgroundColor: "background.paper",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", gap: 0 }}>
          {SUB_NAV_LINKS.map(({ href, label }) => (
            <Box
              key={href}
              component={Link}
              href={href}
              sx={{
                px: 2.5,
                py: 1.5,
                fontSize: "0.75rem",
                fontFamily: '"IBM Plex Mono", monospace',
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: isActive(href) ? PALETTE.brown : alpha(PALETTE.brown, 0.45),
                borderBottom: isActive(href)
                  ? `2px solid ${PALETTE.brown}`
                  : "2px solid transparent",
                transition: "all 0.15s ease",
                "&:hover": {
                  color: PALETTE.brown,
                  borderBottomColor: alpha(PALETTE.brown, 0.3),
                },
              }}
            >
              {label}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

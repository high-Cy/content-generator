"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { alpha } from "@mui/material/styles";
import { PALETTE } from "@/lib/theme";
import type { Session } from "next-auth";

// ─── Nav link definitions ─────────────────────────────────────────────────────
// Add routes here — automatically picked up by desktop nav + mobile drawer.
const NAV_LINKS = [
  { href: "/generate", label: "Generate" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/settings", label: "Settings" },
];

interface NavbarProps {
  session: Session | null;
}

export default function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const handleSignOut = async () => {
    setAnchorEl(null);
    await signOut({ redirect: false });
    router.push("/"); // ✅ Next.js router.push — not window.location
    router.refresh(); // Refresh server components to clear session
  };

  // ─── Desktop Nav ───────────────────────────────────────────────────────────
  const desktopNav = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
      {NAV_LINKS.map(({ href, label }) => (
        <Box
          key={href}
          component={Link}
          href={href}
          sx={{
            px: 2,
            py: 1,
            fontSize: "0.78rem",
            fontFamily: '"IBM Plex Mono", monospace',
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textDecoration: "none",
            color: isActive(href) ? PALETTE.red : alpha(PALETTE.brown, 0.6),
            borderBottom: isActive(href)
              ? `2px solid ${PALETTE.red}`
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
  );

  // ─── User Avatar + Dropdown ───────────────────────────────────────────────
  const userMenu = session ? (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ p: 0.5 }}
        aria-label="User menu"
      >
        <Avatar
          src={session.user?.image ?? undefined}
          alt={session.user?.name ?? "User"}
          sx={{
            width: 32,
            height: 32,
            border: `1px solid ${alpha(PALETTE.brown, 0.2)}`,
          }}
        />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {session.user?.name}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {session.user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          component={Link}
          href="/dashboard/settings"
          onClick={() => setAnchorEl(null)}
        >
          Settings
        </MenuItem>
        <MenuItem onClick={handleSignOut} sx={{ color: PALETTE.red }}>
          Sign out
        </MenuItem>
      </Menu>
    </>
  ) : (
    <Box
      component={Link}
      href="/"
      sx={{
        px: 2,
        py: 1,
        fontSize: "0.78rem",
        fontFamily: '"IBM Plex Mono", monospace',
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        textDecoration: "none",
        color: PALETTE.brown,
        border: `1px solid ${alpha(PALETTE.brown, 0.3)}`,
        transition: "all 0.15s ease",
        "&:hover": {
          backgroundColor: PALETTE.brown,
          color: PALETTE.cream,
        },
      }}
    >
      Sign in
    </Box>
  );

  // ─── Mobile Drawer ────────────────────────────────────────────────────────
  const mobileDrawer = (
    <Drawer
      anchor="right"
      open={mobileOpen}
      onClose={() => setMobileOpen(false)}
      PaperProps={{
        sx: {
          width: 260,
          backgroundColor: PALETTE.cream,
          borderLeft: `1px solid ${alpha(PALETTE.brown, 0.1)}`,
        },
      }}
    >
      <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
        <IconButton onClick={() => setMobileOpen(false)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <List disablePadding>
        {NAV_LINKS.map(({ href, label }) => (
          <ListItemButton
            key={href}
            component={Link}
            href={href}
            selected={isActive(href)}
            onClick={() => setMobileOpen(false)}
            sx={{ px: 3, py: 1.5 }}
          >
            <ListItemText
              primary={label}
              primaryTypographyProps={{
                fontSize: "0.82rem",
                fontFamily: '"IBM Plex Mono", monospace',
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            />
          </ListItemButton>
        ))}
        <Divider sx={{ my: 1 }} />
        {session && (
          <ListItemButton
            onClick={() => {
              setMobileOpen(false);
              handleSignOut();
            }}
            sx={{ px: 3, py: 1.5 }}
          >
            <ListItemText
              primary="Sign out"
              primaryTypographyProps={{
                fontSize: "0.82rem",
                fontFamily: '"IBM Plex Mono", monospace',
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: PALETTE.red,
              }}
            />
          </ListItemButton>
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ minHeight: "60px !important", px: { xs: 2, md: 4 } }}>
          {/* Logo */}
          <Box
            component={Link}
            href={session ? "/dashboard" : "/"}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              textDecoration: "none",
              mr: 4,
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                backgroundColor: PALETTE.red,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AutoAwesomeIcon sx={{ color: PALETTE.white, fontSize: 15 }} />
            </Box>
            <Typography
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                fontSize: "1rem",
                color: PALETTE.brown,
                letterSpacing: "-0.01em",
              }}
            >
              Nóvèl
            </Typography>
          </Box>

          {/* Desktop nav — hidden on mobile */}
          {!isMobile && session && <Box sx={{ flex: 1 }}>{desktopNav}</Box>}
          {!isMobile && <Box sx={{ ml: "auto" }}>{userMenu}</Box>}

          {/* Mobile: hamburger */}
          {isMobile && (
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
              {userMenu}
              {session && (
                <IconButton
                  onClick={() => setMobileOpen(true)}
                  sx={{ ml: 1 }}
                  aria-label="Open menu"
                >
                  <MenuIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {mobileDrawer}
    </>
  );
}

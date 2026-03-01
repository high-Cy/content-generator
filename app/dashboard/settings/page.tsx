// app/dashboard/settings/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Box, Container, Typography } from "@mui/material";
import { PALETTE } from "@/lib/theme";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="caption" sx={{ color: PALETTE.terracotta, display: "block", mb: 1 }}>
          Dashboard — Settings
        </Typography>
        <Typography variant="h2">Settings</Typography>
      </Box>
      <p>Settings panel coming soon.</p>
    </Container>
  );
}

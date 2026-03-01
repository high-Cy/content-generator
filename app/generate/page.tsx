// app/generate/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Box, Container, Typography } from "@mui/material";
import { PALETTE } from "@/lib/theme";

export const metadata = { title: "Generate" };

export default async function GeneratePage() {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="caption" sx={{ color: PALETTE.red, display: "block", mb: 1 }}>
          Generate
        </Typography>
        <Typography variant="h2">Create Content</Typography>
      </Box>
      <p>Content generation form coming soon.</p>
    </Container>
  );
}

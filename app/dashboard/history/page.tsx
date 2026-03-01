// app/dashboard/history/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Box, Container, Typography } from "@mui/material";
import { PALETTE } from "@/lib/theme";

export const metadata = { title: "History" };

export default async function HistoryPage() {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="caption" sx={{ color: PALETTE.terracotta, display: "block", mb: 1 }}>
          Dashboard — History
        </Typography>
        <Typography variant="h2">History</Typography>
      </Box>
      <p>Generated post history coming soon.</p>
    </Container>
  );
}

import Image from "next/image";
import { Box, Typography, Paper } from "@mui/material";
import LoginButton from "@/components/ui/LoginButton";

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) => {
  const { error } = await searchParams;
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
  const initialError =
    error === "AccessDenied"
      ? "Access denied. This account is not authorised to sign in."
      : undefined;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 560, md: 640 },
          minHeight: { sm: 480, md: 560 },
          p: { xs: 4, sm: 6 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Logo / Brand mark */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 5 }}>
          <Image src="/logo.png" alt="Fawn logo" width={120} height={120} />
          <Box>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: "1.4rem",
                color: "text.primary",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Content Generator
            </Typography>
          </Box>
        </Box>

        {/* Heading */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "text.primary",
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            Welcome
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.7, fontSize: "1.05rem" }}
          >
            Sign in to access your content pipeline.
          </Typography>
        </Box>

        <LoginButton clientId={clientId} initialError={initialError} />
      </Paper>
    </Box>
  );
};

export default LoginPage;

import { Box, Typography, Paper, Chip } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LoginButton from "@/components/ui/LoginButton";

export default function LoginPage() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

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
          maxWidth: 420,
          p: { xs: 4, sm: 5 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        {/* Logo / Brand mark */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 18 }} />
          </Box>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              color: "text.primary",
              letterSpacing: "-0.02em",
            }}
          >
            Content Generator
          </Typography>
          <Chip
            label="Private"
            size="small"
            sx={{
              ml: "auto",
              fontSize: "0.65rem",
              height: 20,
              bgcolor: "action.selected",
              color: "text.secondary",
            }}
          />
        </Box>

        {/* Heading */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "text.primary",
            lineHeight: 1.2,
            mb: 1,
          }}
        >
          Welcome back
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 0.5, lineHeight: 1.6 }}
        >
          Sign in to access your Rednote content pipeline.
        </Typography>

        {/* Login button + One Tap */}
        <LoginButton clientId={clientId} />
      </Paper>
    </Box>
  );
}

"use client";

// components/LoginButton.tsx
// Google One Tap + standard OAuth button.
// Uses Next.js router.push — NOT window.location.href.

import Script from "next/script";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Box, Typography, Divider } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { PALETTE } from "@/lib/theme";
import { alpha } from "@mui/material/styles";
import AppButton from "./AppButton";

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface LoginButtonProps {
  clientId: string;
}

export default function LoginButton({ clientId }: LoginButtonProps) {
  const router = useRouter(); // ✅ Next.js router — not window.location
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOneTapResponse = async (response: { credential: string }) => {
    setLoading(true);
    setError(null);
    const result = await signIn("google-one-tap", {
      credential: response.credential,
      redirect: false,
    });
    if (result?.error) {
      setError("Access denied. This account is not authorised.");
      setLoading(false);
    } else {
      router.push("/dashboard"); // ✅ Next.js router
      router.refresh();
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleOneTapResponse,
            cancel_on_tap_outside: false,
            use_fedcm_for_prompt: true,
          });
          window.google.accounts.id.prompt();
        }}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
        {error && (
          <Box
            sx={{
              p: 1.5,
              border: `1px solid ${alpha(PALETTE.red, 0.3)}`,
              backgroundColor: alpha(PALETTE.red, 0.05),
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: PALETTE.red, fontSize: "0.78rem" }}
            >
              {error}
            </Typography>
          </Box>
        )}

        <AppButton
          variant="primary"
          size="large"
          fullWidth
          loading={loading}
          startIcon={<GoogleIcon fontSize="small" />}
          onClick={handleGoogleSignIn}
        >
          Continue with Google
        </AppButton>

        <Divider>
          <Typography variant="caption">or wait for One Tap</Typography>
        </Divider>

        <Typography
          variant="caption"
          sx={{ textAlign: "center", display: "block" }}
        >
          Access restricted to authorised accounts only.
        </Typography>
      </Box>
    </>
  );
}

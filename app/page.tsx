import Image from "next/image";
import { Box } from "@mui/material";
import LoginButton from "@/components/ui/LoginButton";
import { Centred, Row, Card } from "@/components/styled";
import { SectionTitle, PageTitle, MutedText } from "@/components/styled";
import { PALETTE } from "@/lib/theme";

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) => {
  const { error } = await searchParams;
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
  const initialError =
    error === "AccessDenied"
      ? "Sign-in failed — your Google account's email address is not verified."
      : undefined;

  return (
    <Centred sx={{ minHeight: "100vh", backgroundColor: PALETTE.cream, p: 2 }}>
      <Card
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 560, md: 640 },
          minHeight: { sm: 480, md: 560 },
          p: { xs: 4, sm: 6 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Logo / Brand mark */}
        <Row sx={{ gap: 2, mb: 5 }}>
          <Image src="/logo.png" alt="Fawn logo" width={120} height={120} />
          <Box>
            <SectionTitle>Content Generator</SectionTitle>
          </Box>
        </Row>

        {/* Heading */}
        <Box sx={{ mb: 5 }}>
          <PageTitle sx={{ mb: 2 }}>Welcome</PageTitle>
          <MutedText>Sign in to access your content pipeline.</MutedText>
        </Box>

        <LoginButton clientId={clientId} initialError={initialError} />
      </Card>
    </Centred>
  );
};

export default LoginPage;

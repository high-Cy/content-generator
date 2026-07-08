import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import { auth } from "@/auth";
import { resolveAccess } from "@/lib/access";
import { Centred, Card, Row } from "@/components/styled";
import { Eyebrow, PageTitle, MutedText, Caption } from "@/components/styled";
import { PALETTE } from "@/lib/theme";
import SignOutButton from "./SignOutButton";

export const metadata = { title: "Access pending" };

const COPY = {
  pending: {
    eyebrow: "Request received",
    title: "Awaiting approval",
    body: "Your request has been recorded. You'll be able to use Fawn once the owner approves your account — check back later.",
  },
  denied: {
    eyebrow: "Access declined",
    title: "Request declined",
    body: "Your request to use Fawn was declined by the owner.",
  },
  revoked: {
    eyebrow: "Access revoked",
    title: "Access revoked",
    body: "Your access to Fawn has been revoked by the owner.",
  },
} as const;

const PendingPage = async () => {
  const session = await auth();
  if (!session?.user?.email) redirect("/");

  const access = await resolveAccess(session.user.email);
  if (access.status === "approved") redirect("/generate");

  const copy = COPY[access.status];

  return (
    <Centred sx={{ minHeight: "calc(100vh - 60px)", backgroundColor: PALETTE.cream, p: 2 }}>
      <Card sx={{ width: "100%", maxWidth: 560, p: { xs: 4, sm: 6 } }}>
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <PageTitle sx={{ mt: 1, mb: 2 }}>{copy.title}</PageTitle>
        <MutedText sx={{ mb: 4 }}>{copy.body}</MutedText>

        <Box sx={{ mb: 4 }}>
          <Caption>Signed in as {session.user.email}</Caption>
        </Box>

        <Row sx={{ gap: 2 }}>
          <SignOutButton />
        </Row>
      </Card>
    </Centred>
  );
};

export default PendingPage;

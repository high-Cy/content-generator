import Box from "@mui/material/Box";
import { requirePageAccess, isOwnerEmail } from "@/lib/access";
import { listUsers } from "@/lib/db/users";
import { formatDateTime } from "@/lib/format";
import type { User } from "@/lib/db/schema";
import {
  PageWrapper, PageContainer, Section, PageHeader, Col, Row, SpacedRow,
} from "@/components/styled";
import { Eyebrow, PageTitle, SectionTitle, MutedText, Caption, CardTitle } from "@/components/styled";
import { Card, InlineTag, Callout } from "@/components/styled";
import { AppButton, StatusChip } from "@/components/ui";
import { approveUser, denyUser, revokeUser } from "./actions";

export const metadata = { title: "Admin" };

const STATUS_CHIP: Record<User["status"], "warning" | "success" | "error" | "default"> = {
  pending: "warning",
  approved: "success",
  denied: "error",
  revoked: "error",
};

const ActionForm = ({
  action,
  email,
  label,
  variant,
}: {
  action: (formData: FormData) => Promise<void>;
  email: string;
  label: string;
  variant: "primary" | "outline" | "ghost" | "danger";
}) => (
  <form action={action}>
    <input type="hidden" name="email" value={email} />
    <AppButton type="submit" variant={variant} size="small">
      {label}
    </AppButton>
  </form>
);

const AdminPage = async () => {
  await requirePageAccess("admin");

  let allUsers: User[] = [];
  let dbError = false;

  try {
    allUsers = await listUsers();
  } catch {
    dbError = true;
  }

  const pending = allUsers.filter((u) => u.status === "pending");
  const others = allUsers.filter((u) => u.status !== "pending");

  return (
    <PageWrapper>
      <PageContainer>
        <Section>
          <PageHeader>
            <Eyebrow>Access Control</Eyebrow>
            <PageTitle style={{ marginTop: 8 }}>Admin</PageTitle>
            <MutedText style={{ marginTop: 8 }}>
              Approve access requests and manage who can use Fawn.
            </MutedText>
          </PageHeader>

          {dbError && (
            <Callout variant="warning" sx={{ mb: 4 }}>
              <Caption>Database not connected — user list unavailable</Caption>
            </Callout>
          )}

          {/* ── Pending requests ── */}
          <Box sx={{ mb: 6 }}>
            <SectionTitle sx={{ mb: 2 }}>
              Pending requests{pending.length > 0 ? ` (${pending.length})` : ""}
            </SectionTitle>

            {!dbError && pending.length === 0 && (
              <Callout variant="info">
                <Caption>No pending requests.</Caption>
              </Callout>
            )}

            <Col sx={{ gap: 2 }}>
              {pending.map((u) => (
                <Card key={u.id}>
                  <SpacedRow sx={{ flexWrap: "wrap", gap: 2 }}>
                    <Col sx={{ gap: 0.5 }}>
                      <CardTitle>{u.name ?? u.email}</CardTitle>
                      <Caption>{u.email}</Caption>
                      <Caption>Requested {formatDateTime(u.createdAt)}</Caption>
                    </Col>
                    <Row sx={{ gap: 1.5 }}>
                      <ActionForm action={approveUser} email={u.email} label="Approve" variant="primary" />
                      <ActionForm action={denyUser} email={u.email} label="Deny" variant="danger" />
                    </Row>
                  </SpacedRow>
                </Card>
              ))}
            </Col>
          </Box>

          {/* ── All users ── */}
          <Box>
            <SectionTitle sx={{ mb: 2 }}>Users</SectionTitle>

            {!dbError && others.length === 0 && (
              <Callout variant="info">
                <Caption>No users yet.</Caption>
              </Callout>
            )}

            <Col sx={{ gap: 2 }}>
              {others.map((u) => {
                const owner = isOwnerEmail(u.email);
                return (
                  <Card key={u.id}>
                    <SpacedRow sx={{ flexWrap: "wrap", gap: 2 }}>
                      <Col sx={{ gap: 0.5 }}>
                        <Row sx={{ gap: 1, flexWrap: "wrap" }}>
                          <CardTitle>{u.name ?? u.email}</CardTitle>
                          <StatusChip status={STATUS_CHIP[u.status]} label={u.status} />
                          {u.role === "admin" && <InlineTag>admin</InlineTag>}
                          {owner && <InlineTag>owner</InlineTag>}
                        </Row>
                        <Caption>{u.email}</Caption>
                        <Caption>Last sign-in {formatDateTime(u.lastSignInAt)}</Caption>
                      </Col>
                      {!owner && (
                        <Row sx={{ gap: 1.5 }}>
                          {u.status === "approved" ? (
                            <ActionForm action={revokeUser} email={u.email} label="Revoke" variant="danger" />
                          ) : (
                            <ActionForm action={approveUser} email={u.email} label="Approve" variant="outline" />
                          )}
                        </Row>
                      )}
                    </SpacedRow>
                  </Card>
                );
              })}
            </Col>
          </Box>
        </Section>
      </PageContainer>
    </PageWrapper>
  );
};

export default AdminPage;

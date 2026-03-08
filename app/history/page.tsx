import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import Box from "@mui/material/Box";
import { db } from "@/lib/db";
import { generations } from "@/lib/db/schema";
import type { Generation } from "@/lib/db/schema";
import {
  PageWrapper, PageContainer, Section, PageHeader, Col, SpacedRow, Row,
} from "@/components/styled";
import { Eyebrow, PageTitle, MutedText, BodyText, Caption, CardTitle } from "@/components/styled";
import { AccentCard, InlineTag, Callout } from "@/components/styled";

export const metadata = { title: "History" };

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const HistoryPage = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  let history: Generation[] = [];
  let dbError = false;

  try {
    history = await db
      .select()
      .from(generations)
      .where(eq(generations.userId, session.user.id))
      .orderBy(desc(generations.createdAt));
  } catch {
    dbError = true;
  }

  return (
    <PageWrapper>
      <PageContainer>
        <Section>
          <PageHeader>
            <Eyebrow>Content Studio</Eyebrow>
            <PageTitle style={{ marginTop: 8 }}>History</PageTitle>
            <MutedText style={{ marginTop: 8 }}>
              {history.length > 0
                ? `${history.length} post${history.length === 1 ? "" : "s"} generated`
                : "No posts yet"}
            </MutedText>
          </PageHeader>

          {dbError && (
            <Callout variant="warning" sx={{ mb: 4 }}>
              <Caption>Database not connected — set DATABASE_URL to view history</Caption>
            </Callout>
          )}

          {!dbError && history.length === 0 && (
            <Callout variant="info">
              <Caption>No posts yet — head to Generate to create your first post.</Caption>
            </Callout>
          )}

          <Col sx={{ gap: 2 }}>
            {history.map((gen) => (
              <AccentCard
                key={gen.id}
                accent={gen.status === "failed" ? "red" : "sage"}
              >
                <SpacedRow sx={{ mb: 1.5 }}>
                  <Row sx={{ gap: 1, flexWrap: "wrap" }}>
                    <CardTitle>{gen.restaurantName}</CardTitle>
                    <InlineTag
                      sx={{ color: gen.status === "failed" ? "error.main" : "success.main" }}
                    >
                      {gen.status}
                    </InlineTag>
                  </Row>
                  <Caption>{formatDate(gen.createdAt)}</Caption>
                </SpacedRow>

                <Box sx={{ mb: 1 }}>
                  <Caption>{gen.foodOrdered}</Caption>
                </Box>

                <BodyText>
                  {gen.output.slice(0, 200)}
                  {gen.output.length > 200 ? "…" : ""}
                </BodyText>
              </AccentCard>
            ))}
          </Col>
        </Section>
      </PageContainer>
    </PageWrapper>
  );
};

export default HistoryPage;

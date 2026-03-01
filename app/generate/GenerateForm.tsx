"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import { AppButton, AppInput, AppToast, useToast } from "@/components/ui";
import {
  PageWrapper, PageContainer, Section, PageHeader,
  Panel, Col, Row, SpacedRow, FieldGroup,
} from "@/components/styled";
import {
  Eyebrow, PageTitle, MutedText, Caption, BodyText,
} from "@/components/styled";
import { Well, Callout } from "@/components/styled";
import { PALETTE } from "@/lib/theme";

const GenerateForm = () => {
  const { toast, showToast, hideToast } = useToast();

  // Scraper state
  const [urls, setUrls] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");
  const [scrapedContent, setScrapedContent] = useState("");

  // Form state
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [foodOrdered, setFoodOrdered] = useState("");
  const [examplePosts, setExamplePosts] = useState("");
  const [showExamples, setShowExamples] = useState(false);

  // Output state
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleScrape = async () => {
    const urlList = urls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    if (urlList.length === 0) return;

    setScraping(true);
    setScrapeError("");

    const results: string[] = [];
    const errors: string[] = [];

    await Promise.all(
      urlList.map(async (url) => {
        try {
          const res = await fetch("/api/scrape", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          results.push(`--- ${url} ---\n${data.content}`);
        } catch {
          errors.push(url);
        }
      })
    );

    if (results.length > 0) setScrapedContent(results.join("\n\n"));
    if (errors.length > 0) {
      setScrapeError(`Failed to scrape: ${errors.join(", ")}`);
    } else {
      showToast(`Scraped ${results.length} URL${results.length > 1 ? "s" : ""}`, "success");
    }

    setScraping(false);
  };

  const handleGenerate = async () => {
    if (!restaurantName.trim() || !foodOrdered.trim()) return;
    setGenerating(true);
    setOutput("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: restaurantName.trim(),
          restaurantAddress: restaurantAddress.trim() || undefined,
          foodOrdered: foodOrdered.trim(),
          examplePosts: examplePosts.trim() || undefined,
          scrapedContent: scrapedContent.trim() || undefined,
          sourceUrls: urls.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOutput(data.output);
      showToast("Generated and saved", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Generation failed", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canGenerate = restaurantName.trim() !== "" && foodOrdered.trim() !== "";

  return (
    // Extra bottom padding so content isn't hidden behind sticky footer
    <PageWrapper sx={{ pb: "80px" }}>
      <PageContainer>
        <Section>
          <PageHeader>
            <Eyebrow>Content Studio</Eyebrow>
            <PageTitle style={{ marginTop: 8 }}>Generate</PageTitle>
            <MutedText style={{ marginTop: 8 }}>
              Fill in the details, optionally scrape reference URLs, and generate.
            </MutedText>
          </PageHeader>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              alignItems: "stretch",
              gap: 4,
            }}
          >
            {/* ── Left: Input ── */}
            <Col sx={{ gap: 3 }}>
              <Panel>
                <Eyebrow style={{ marginBottom: 16 }}>Review Details</Eyebrow>
                <Col sx={{ gap: 2 }}>
                  <AppInput
                    label="Restaurant name"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                  />
                  <AppInput
                    label="Address (optional)"
                    value={restaurantAddress}
                    onChange={(e) => setRestaurantAddress(e.target.value)}
                    placeholder="e.g. 100 Victoria Street, Carlton, 3053"
                  />
                  <AppInput
                    label="Food ordered"
                    value={foodOrdered}
                    onChange={(e) => setFoodOrdered(e.target.value)}
                    placeholder="e.g. Wagyu beef ramen, gyoza, matcha latte"
                  />
                </Col>
              </Panel>
              <Panel>
                <Box
                  component="button"
                  onClick={() => setShowExamples(!showExamples)}
                  sx={{ background: "none", border: "none", cursor: "pointer", p: 0 }}
                >
                  <Eyebrow>{showExamples ? "- " : "+ "}Example posts (style reference)</Eyebrow>
                </Box>
                {showExamples && (
                  <FieldGroup sx={{ mt: 2 }}>
                    <AppInput
                      label="Paste 1-3 high-performing posts"
                      multiline
                      rows={8}
                      value={examplePosts}
                      onChange={(e) => setExamplePosts(e.target.value)}
                      placeholder="Paste example posts you want the AI to match in style and tone..."
                    />
                  </FieldGroup>
                )}
              </Panel>
              <Panel>
                <Eyebrow style={{ marginBottom: 16 }}>Reference URLs</Eyebrow>
                <AppInput
                  label="URLs (one per line)"
                  multiline
                  rows={4}
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  placeholder={"https://example.com/review\nhttps://another.com/article"}
                />
                {scrapeError && (
                  <Callout variant="error" sx={{ mt: 2 }}>
                    <Caption>{scrapeError}</Caption>
                  </Callout>
                )}
                {scrapedContent && (
                  <Callout variant="success" sx={{ mt: 2 }}>
                    <Caption>Content scraped — will be included in prompt</Caption>
                  </Callout>
                )}
                <Row sx={{ justifyContent: "flex-end", mt: 2 }}>
                  <AppButton
                    variant="outline"
                    onClick={handleScrape}
                    loading={scraping}
                    disabled={!urls.trim()}
                    size="small"
                  >
                    Scrape URLs
                  </AppButton>
                </Row>
              </Panel>
            </Col>

            {/* ── Right: Output — stretches to match left column height ── */}
            <Col sx={{ height: "100%" }}>
              <Panel
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <SpacedRow>
                  <Eyebrow>Output</Eyebrow>
                  {output && (
                    <AppButton variant="outline" onClick={handleCopy} size="small">
                      {copied ? "Copied!" : "Copy"}
                    </AppButton>
                  )}
                </SpacedRow>

                {output ? (
                  <Well sx={{ flex: 1, overflowY: "auto" }}>
                    <BodyText style={{ whiteSpace: "pre-wrap" }}>{output}</BodyText>
                  </Well>
                ) : (
                  <Well
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MutedText>Generated post will appear here</MutedText>
                  </Well>
                )}
              </Panel>
            </Col>
          </Box>
        </Section>
      </PageContainer>

      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          zIndex: 10,
          backgroundColor: alpha(PALETTE.cream, 0.92),
          backdropFilter: "blur(8px)",
          borderTop: `1px solid ${alpha(PALETTE.brown, 0.1)}`,
          py: 1.5,
          px: { xs: 2, md: 4 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        {output && (
          <AppButton variant="outline" onClick={handleCopy} size="small">
            {copied ? "Copied!" : "Copy"}
          </AppButton>
        )}
        <AppButton
          variant="primary"
          onClick={handleGenerate}
          loading={generating}
          disabled={!canGenerate}
          size="large"
          sx={{ minWidth: 180 }}
        >
          Generate Post
        </AppButton>
      </Box>

      <AppToast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={hideToast}
      />
    </PageWrapper>
  );
};

export default GenerateForm;

"use client";

import { useState } from "react";
import { AppButton, AppInput, AppToast, useToast } from "@/components/ui";
import {
  PageWrapper, PageContainer, Section, PageHeader,
  Panel, Col, SpacedRow, FieldGroup,
  TwoColGrid, StickyFooter, PlainButton,
} from "@/components/styled";
import {
  Eyebrow, PageTitle, MutedText, BodyText,
} from "@/components/styled";
import { Well } from "@/components/styled";

const GenerateForm = () => {
  const { toast, showToast, hideToast } = useToast();

  // Form state
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [foodOrdered, setFoodOrdered] = useState("");
  const [focusBrief, setFocusBrief] = useState("");
  const [examplePosts, setExamplePosts] = useState("");
  const [showExamples, setShowExamples] = useState(false);

  // Output state
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

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
          focusBrief: focusBrief.trim() || undefined,
          examplePosts: examplePosts.trim() || undefined,
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
              Fill in the details and generate.
            </MutedText>
          </PageHeader>

          <TwoColGrid>
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
                  <AppInput
                    label="Focus / brief (optional)"
                    value={focusBrief}
                    onChange={(e) => setFocusBrief(e.target.value)}
                    placeholder="e.g. focus on the truffle pasta"
                    multiline
                    rows={2}
                  />
                </Col>
              </Panel>
              <Panel>
                <PlainButton onClick={() => setShowExamples(!showExamples)}>
                  <Eyebrow>{showExamples ? "- " : "+ "}Example posts (style reference)</Eyebrow>
                </PlainButton>
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
          </TwoColGrid>
        </Section>
      </PageContainer>

      <StickyFooter>
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
      </StickyFooter>

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

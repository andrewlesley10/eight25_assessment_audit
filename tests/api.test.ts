import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/fetch/fetchPage", () => ({
  fetchPage: vi.fn().mockResolvedValue({
    html: "<html><head><title>Test</title></head><body><h1>Test</h1><p>Hello world content.</p></body></html>",
    finalUrl: "https://example.com"
  })
}));

vi.mock("@/lib/analyze/runAuditAnalysis", () => ({
  runAuditAnalysis: vi.fn().mockResolvedValue({
    insights: {
      executiveSummary: "Solid base with room to improve structure and CTA clarity.",
      seoStructure: { status: "warning", summary: "Needs more hierarchy.", evidence: ["Only one H1 detected"] },
      messagingClarity: { status: "good", summary: "The message is reasonably clear.", evidence: ["Visible paragraph content exists"] },
      ctaUsage: { status: "warning", summary: "CTA usage is light.", evidence: ["One CTA detected"] },
      contentDepth: { status: "warning", summary: "Content is thin.", evidence: ["Word count is limited"] },
      uxStructuralConcerns: { status: "mixed", summary: "The layout appears basic from the HTML.", evidence: ["Minimal semantic structure"] },
      prioritizedRecommendations: [
        { priority: "high", title: "Add supporting sections", rationale: "Thin page depth.", action: "Introduce H2 sections." },
        { priority: "medium", title: "Strengthen CTA copy", rationale: "CTA presence is light.", action: "Use clearer action language." },
        { priority: "low", title: "Expand descriptive copy", rationale: "Body excerpt is short.", action: "Add more context." }
      ]
    },
    trace: {
      timestamp: "2026-03-28T00:00:00.000Z",
      url: "https://example.com",
      systemPrompt: "system",
      userPrompt: "user",
      promptConstruction: {
        builder: "buildAuditPrompt(metrics)",
        sections: ["Task framing and grounding rules"]
      },
      structuredInput: {
        url: "https://example.com",
        finalUrl: "https://example.com",
        metaTitle: "Test",
        metaDescription: null,
        totalWordCount: 3,
        headings: { h1: 1, h2: 0, h3: 0 },
        ctas: { count: 0, samples: [] },
        links: { total: 0, internal: 0, external: 0 },
        images: { total: 0, missingAlt: 0, missingAltPercent: 0, altSamples: [] },
        contentPreview: { title: "Test", topHeadings: ["Test"], firstParagraphs: ["Hello world content."], bodyExcerpt: "Hello world content." }
      },
      rawModelOutput: "{}",
      parsedOutput: null
    }
  })
}));

vi.mock("@/lib/logging/writePromptLog", () => ({
  writePromptLog: vi.fn().mockResolvedValue(undefined)
}));

import { POST } from "@/app/api/audit/route";

describe("POST /api/audit", () => {
  it("returns a successful payload", async () => {
    const request = new Request("http://localhost/api/audit", {
      method: "POST",
      body: JSON.stringify({ url: "example.com" }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const response = await POST(request as never);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.metrics.finalUrl).toBe("https://example.com");
  });
});

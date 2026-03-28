import { afterEach, describe, expect, it, vi } from "vitest";
import { AuditError } from "@/lib/utils/errors";
import { runAuditAnalysis } from "@/lib/analyze/runAuditAnalysis";
import type { ExtractedMetrics } from "@/types/audit";

const metrics: ExtractedMetrics = {
  url: "https://example.com",
  finalUrl: "https://example.com",
  metaTitle: "Example Domain",
  metaDescription: null,
  totalWordCount: 32,
  headings: {
    h1: 1,
    h2: 0,
    h3: 0
  },
  ctas: {
    count: 1,
    samples: ["Learn more"]
  },
  links: {
    total: 1,
    internal: 0,
    external: 1
  },
  images: {
    total: 0,
    missingAlt: 0,
    missingAltPercent: 0,
    altSamples: []
  },
  contentPreview: {
    title: "Example Domain",
    topHeadings: ["Example Domain"],
    firstParagraphs: ["This domain is for use in illustrative examples in documents."],
    bodyExcerpt: "Example Domain This domain is for use in illustrative examples in documents."
  }
};

describe("runAuditAnalysis", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.OLLAMA_BASE_URL;
    delete process.env.OLLAMA_MODEL;
    delete process.env.OLLAMA_API_KEY;
  });

  it("normalizes a base URL without /api", async () => {
    process.env.OLLAMA_BASE_URL = "https://ollama.com";
    process.env.OLLAMA_MODEL = "qwen3:8b";
    process.env.OLLAMA_API_KEY = "test-key";

    const fetchSpy = vi.spyOn(global, "fetch");
    fetchSpy
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            models: [{ name: "qwen3:8b" }]
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
        JSON.stringify({
          response: JSON.stringify({
            executiveSummary: "Clear page with thin supporting structure.",
            seoStructure: {
              status: "warning",
              summary: "Only one major heading is present.",
              evidence: ["headings.h1 = 1", "headings.h2 = 0"]
            },
            messagingClarity: {
              status: "good",
              summary: "The message is easy to understand.",
              evidence: ["contentPreview.firstParagraphs contains descriptive copy"]
            },
            ctaUsage: {
              status: "warning",
              summary: "CTA coverage is minimal.",
              evidence: ["ctas.count = 1"]
            },
            contentDepth: {
              status: "warning",
              summary: "The page is light on depth.",
              evidence: ["totalWordCount = 32"]
            },
            uxStructuralConcerns: {
              status: "mixed",
              summary: "The layout is simple but sparse.",
              evidence: ["headings.h2 = 0", "images.total = 0"]
            },
            prioritizedRecommendations: [
              {
                priority: "high",
                title: "Add supporting sections",
                rationale: "The page only has one H1 and no supporting H2s.",
                action: "Introduce 2 to 3 H2 sections that explain the offer and next steps."
              },
              {
                priority: "medium",
                title: "Strengthen CTA copy",
                rationale: "There is only one CTA sample.",
                action: "Use a more specific CTA label tied to the page goal."
              },
              {
                priority: "low",
                title: "Expand core copy",
                rationale: "The current word count is very low.",
                action: "Add concise supporting paragraphs that address value and credibility."
              }
            ]
          })
        }),
        { status: 200 }
        )
      );

    await runAuditAnalysis(metrics);

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      "https://ollama.com/api/tags",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-key"
        })
      })
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      "https://ollama.com/api/generate",
      expect.objectContaining({
        method: "POST"
      })
    );
  });

  it("shows a more actionable 404 message", async () => {
    process.env.OLLAMA_BASE_URL = "https://ollama.com/api";
    process.env.OLLAMA_MODEL = "qwen3:8b";
    process.env.OLLAMA_API_KEY = "test-key";

    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            models: []
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response("model not found", { status: 404 }));

    await expect(runAuditAnalysis(metrics)).rejects.toMatchObject(
      {
        message:
          "Ollama returned HTTP 404. Verify OLLAMA_BASE_URL (https://ollama.com/api) and OLLAMA_MODEL (qwen3:8b). model not found",
        code: "AI_FAILED"
      } satisfies Pick<AuditError, "message" | "code">
    );
  });
});

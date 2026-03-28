export type AuditInsightStatus = "good" | "warning" | "poor" | "mixed";
export type RecommendationPriority = "high" | "medium" | "low";

export type ExtractedMetrics = {
  url: string;
  finalUrl: string;
  metaTitle: string | null;
  metaDescription: string | null;
  totalWordCount: number;
  headings: {
    h1: number;
    h2: number;
    h3: number;
  };
  ctas: {
    count: number;
    samples: string[];
  };
  links: {
    total: number;
    internal: number;
    external: number;
  };
  images: {
    total: number;
    missingAlt: number;
    missingAltPercent: number;
    altSamples: string[];
  };
  contentPreview: {
    title: string | null;
    topHeadings: string[];
    firstParagraphs: string[];
    bodyExcerpt: string;
  };
};

export type AuditInsight = {
  status: AuditInsightStatus;
  summary: string;
  evidence: string[];
};

export type Recommendation = {
  priority: RecommendationPriority;
  title: string;
  rationale: string;
  action: string;
};

export type AiAuditResult = {
  executiveSummary: string;
  seoStructure: AuditInsight;
  messagingClarity: AuditInsight;
  ctaUsage: AuditInsight;
  contentDepth: AuditInsight;
  uxStructuralConcerns: AuditInsight;
  prioritizedRecommendations: Recommendation[];
};

export type PromptTrace = {
  timestamp: string;
  url: string;
  systemPrompt: string;
  userPrompt: string;
  promptConstruction: {
    builder: string;
    sections: string[];
  };
  structuredInput: ExtractedMetrics;
  rawModelOutput: string;
  parsedOutput: AiAuditResult | null;
};

export type AuditResponse = {
  success: true;
  data: {
    metrics: ExtractedMetrics;
    insights: AiAuditResult | null;
    trace: PromptTrace;
    warnings: string[];
  };
};

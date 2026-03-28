import { z } from "zod";

const auditInsightSchema = z.object({
  status: z.enum(["good", "warning", "poor", "mixed"]),
  summary: z.string().min(1),
  evidence: z.array(z.string()).min(1)
});

const recommendationSchema = z.object({
  priority: z.enum(["high", "medium", "low"]),
  title: z.string().min(1),
  rationale: z.string().min(1),
  action: z.string().min(1)
});

export const aiAuditSchema = z.object({
  executiveSummary: z.string().min(1),
  seoStructure: auditInsightSchema,
  messagingClarity: auditInsightSchema,
  ctaUsage: auditInsightSchema,
  contentDepth: auditInsightSchema,
  uxStructuralConcerns: auditInsightSchema,
  prioritizedRecommendations: z.array(recommendationSchema).min(3).max(5)
});

export type AiAuditOutput = z.infer<typeof aiAuditSchema>;

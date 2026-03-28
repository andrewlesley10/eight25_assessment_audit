import type { ExtractedMetrics } from "@/types/audit";

export function buildAuditPrompt(metrics: ExtractedMetrics) {
  const sections = [
    "Task framing and grounding rules",
    "Required JSON response schema",
    "Structured extracted metrics payload"
  ];

  const userPrompt = `
Analyze this single webpage URL using only the structured facts below.

Return JSON that matches this schema:
{
  "executiveSummary": "string",
  "seoStructure": { "status": "good|warning|poor|mixed", "summary": "string", "evidence": ["string"] },
  "messagingClarity": { "status": "good|warning|poor|mixed", "summary": "string", "evidence": ["string"] },
  "ctaUsage": { "status": "good|warning|poor|mixed", "summary": "string", "evidence": ["string"] },
  "contentDepth": { "status": "good|warning|poor|mixed", "summary": "string", "evidence": ["string"] },
  "uxStructuralConcerns": { "status": "good|warning|poor|mixed", "summary": "string", "evidence": ["string"] },
  "prioritizedRecommendations": [
    { "priority": "high|medium|low", "title": "string", "rationale": "string", "action": "string" }
  ]
}

Rules:
- Use only the structured input.
- Do not claim performance scores, rankings, traffic, or analytics.
- Recommendations must be tied to extracted facts.
- Return 3 to 5 recommendations.

Structured input:
${JSON.stringify(metrics, null, 2)}
`.trim();

  return {
    userPrompt,
    promptConstruction: {
      builder: "buildAuditPrompt(metrics)",
      sections
    }
  };
}

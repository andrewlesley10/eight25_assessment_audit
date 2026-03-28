import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AiAuditResult } from "@/types/audit";

const cards = [
  ["SEO Structure", "seoStructure"],
  ["Messaging Clarity", "messagingClarity"],
  ["CTA Usage", "ctaUsage"],
  ["Content Depth", "contentDepth"],
  ["UX / Structural Concerns", "uxStructuralConcerns"]
] as const;

export function InsightsSection({ insights }: { insights: AiAuditResult }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {cards.map(([label, key]) => {
        const insight = insights[key];
        const tone =
          insight.status === "good"
            ? "good"
            : insight.status === "poor"
              ? "poor"
              : insight.status === "warning"
                ? "warning"
                : "accent";

        return (
          <Card key={key} className="border-t-4 border-t-white/10 p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-white">{label}</h3>
              <Badge tone={tone}>{insight.status}</Badge>
            </div>
            <p className="mt-4 text-slate-300">{insight.summary}</p>
            <div className="mt-5 text-xs uppercase tracking-[0.18em] text-slate-500">Evidence</div>
            <ul className="mt-3 space-y-2 text-slate-300">
              {insight.evidence.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}

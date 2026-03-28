import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AiAuditResult, ExtractedMetrics } from "@/types/audit";

function calculateScore(metrics: ExtractedMetrics, insights: AiAuditResult | null) {
  let score = 84;
  if (!metrics.metaTitle) score -= 8;
  if (!metrics.metaDescription) score -= 8;
  if (metrics.headings.h1 !== 1) score -= 8;
  if (metrics.headings.h2 === 0) score -= 6;
  if (metrics.ctas.count === 0) score -= 8;
  if (metrics.totalWordCount < 300) score -= 8;
  if (metrics.images.total > 0) score -= Math.round(metrics.images.missingAltPercent / 12);
  if (insights) score -= insights.prioritizedRecommendations.filter((item) => item.priority === "high").length * 4;
  return Math.max(42, Math.min(95, score));
}

function gradeLabel(score: number) {
  if (score >= 80) return "Good";
  if (score >= 60) return "Needs Improvement";
  return "Priority Review";
}

export function SummaryHeader({
  metrics,
  insights,
  model
}: {
  metrics: ExtractedMetrics;
  insights: AiAuditResult | null;
  model: string;
}) {
  const score = calculateScore(metrics, insights);
  const grade = gradeLabel(score);

  return (
    <Card className="grid gap-8 p-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="grid justify-items-center gap-4">
        <div
          className="grid h-48 w-48 place-items-center rounded-full"
          style={{
            background: `conic-gradient(#f0b100 ${score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`
          }}
        >
          <div className="grid h-36 w-36 place-items-center rounded-full bg-[#09101d]">
            <div className="text-center">
              <div className="text-6xl font-semibold tracking-tight text-white">{score}</div>
              <div className="text-sm text-slate-400">/ 100</div>
            </div>
          </div>
        </div>
        <div className="text-center text-lg text-slate-300">
          Overall Grade: <span className="font-semibold text-[#f0b100]">{grade}</span>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-3">
          <div className="text-sm text-slate-400">AI readiness report for {metrics.finalUrl}</div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-4xl font-semibold tracking-tight text-white">Executive Summary</h2>
            <Badge tone="accent">{model}</Badge>
          </div>
          <p className="max-w-4xl text-lg leading-8 text-slate-300">
            {insights?.executiveSummary ??
              "The factual extraction completed successfully. AI insight generation was unavailable for this run."}
          </p>
        </div>
      </div>
    </Card>
  );
}

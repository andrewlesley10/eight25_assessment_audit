import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Recommendation } from "@/types/audit";

export function RecommendationsSection({
  recommendations
}: {
  recommendations: Recommendation[];
}) {
  return (
    <div className="grid gap-4">
      {recommendations.map((recommendation) => {
        const tone =
          recommendation.priority === "high"
            ? "poor"
            : recommendation.priority === "medium"
              ? "warning"
              : "good";

        return (
          <Card key={`${recommendation.priority}-${recommendation.title}`} className="p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-white">{recommendation.title}</h3>
              <Badge tone={tone}>{recommendation.priority} priority</Badge>
            </div>
            <p className="mt-4 text-slate-300">{recommendation.rationale}</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
              <span className="block text-xs uppercase tracking-[0.18em] text-slate-500">Action</span>
              <span className="mt-2 block">{recommendation.action}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

import { Card } from "@/components/ui/card";
import type { ExtractedMetrics } from "@/types/audit";

export function LinkAnalysisCard({ metrics }: { metrics: ExtractedMetrics }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white">Link Analysis</h3>
      <div className="mt-5 space-y-3 text-slate-300">
        <p>Total links: {metrics.links.total}</p>
        <p>Internal links: {metrics.links.internal}</p>
        <p>External links: {metrics.links.external}</p>
        <p>CTA samples: {metrics.ctas.samples.length > 0 ? metrics.ctas.samples.join(", ") : "Unavailable"}</p>
      </div>
    </Card>
  );
}

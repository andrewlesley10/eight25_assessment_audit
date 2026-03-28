import { Card } from "@/components/ui/card";
import type { ExtractedMetrics } from "@/types/audit";

export function ImageAnalysisCard({ metrics }: { metrics: ExtractedMetrics }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white">Media Analysis</h3>
      <div className="mt-5 space-y-3 text-slate-300">
        <p>Total images: {metrics.images.total}</p>
        <p>Images missing alt text: {metrics.images.missingAlt}</p>
        <p>Missing alt percentage: {metrics.images.missingAltPercent}%</p>
        <p>Alt text samples: {metrics.images.altSamples.length > 0 ? metrics.images.altSamples.join(", ") : "Unavailable"}</p>
      </div>
    </Card>
  );
}

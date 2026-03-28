import { Card } from "@/components/ui/card";
import type { ExtractedMetrics } from "@/types/audit";

export function MetadataCard({ metrics }: { metrics: ExtractedMetrics }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white">Metadata</h3>
      <div className="mt-5 grid gap-5">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Meta title</div>
          <p className="mt-2 text-slate-200">{metrics.metaTitle ?? "Unavailable"}</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Meta description</div>
          <p className="mt-2 text-slate-200">{metrics.metaDescription ?? "Unavailable"}</p>
        </div>
      </div>
    </Card>
  );
}

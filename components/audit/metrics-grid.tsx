import { Card } from "@/components/ui/card";
import type { ExtractedMetrics } from "@/types/audit";

export function MetricsGrid({ metrics }: { metrics: ExtractedMetrics }) {
  const items = [
    ["Word Count", metrics.totalWordCount.toLocaleString()],
    ["CTAs", metrics.ctas.count.toString()],
    ["Internal Links", metrics.links.internal.toString()],
    ["External Links", metrics.links.external.toString()],
    ["Images", metrics.images.total.toString()],
    ["Missing Alt %", `${metrics.images.missingAltPercent}%`]
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {items.map(([label, value]) => (
        <Card key={label} className="p-5">
          <div className="text-sm text-slate-400">{label}</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</div>
        </Card>
      ))}
    </div>
  );
}

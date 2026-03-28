"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { ImageAnalysisCard } from "@/components/audit/image-analysis-card";
import { InsightsSection } from "@/components/audit/insights-section";
import { LinkAnalysisCard } from "@/components/audit/link-analysis-card";
import { LoadingState } from "@/components/audit/loading-state";
import { MetadataCard } from "@/components/audit/metadata-card";
import { MetricsGrid } from "@/components/audit/metrics-grid";
import { RecommendationsSection } from "@/components/audit/recommendations-section";
import { SummaryHeader } from "@/components/audit/summary-header";
import { TracePanel } from "@/components/audit/trace-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AuditResponse } from "@/types/audit";

const loadingSteps = [0, 1, 2, 3, 4];

type ErrorResponse = {
  success: false;
  error: {
    message: string;
  };
};

export function UrlForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResponse | null>(null);

  useEffect(() => {
    if (!loading) {
      setStepIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setStepIndex((current) => Math.min(current + 1, loadingSteps.length - 1));
    }, 1400);

    return () => window.clearInterval(interval);
  }, [loading]);

  const hasInsights = useMemo(() => Boolean(result?.data.insights), [result]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });

      const data = (await response.json()) as AuditResponse | ErrorResponse;
      if (!response.ok || !("success" in data) || data.success !== true) {
        throw new Error("error" in data ? data.error.message : "Audit failed.");
      }

      setResult(data);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Audit failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden p-8 lg:p-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_420px]">
          <div className="space-y-6">
            <Badge tone="accent" className="uppercase tracking-[0.18em]">
              Premium internal intelligence tool
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
                Audit a single webpage with factual extraction first and grounded AI second.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Built for agency teams reviewing SEO structure, messaging clarity, CTA strength,
                content depth, and obvious UX concerns on one page at a time.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge tone="neutral">Single URL only</Badge>
              <Badge tone="neutral">Deterministic metrics</Badge>
              <Badge tone="neutral">Ollama-only AI layer</Badge>
              <Badge tone="neutral">Prompt transparency included</Badge>
            </div>
          </div>

          <Card className="border-white/10 bg-white/5 p-6">
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <span className="text-lg font-semibold">Run audit</span>
                </div>
                <p className="text-sm leading-6 text-slate-400">
                  Enter a public page URL to generate metrics, AI insights, recommendations, and trace logs.
                </p>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">Website URL</span>
                <input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-2xl border border-white/10 bg-[#09111f] px-4 py-4 text-slate-100 placeholder:text-slate-500 focus:border-cobalt/60 focus:outline-none focus:ring-2 focus:ring-cobalt/30"
                  required
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <Button type="submit">
                  Analyze URL
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" onClick={() => setUrl("https://example.com")}>
                  Use sample URL
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Card>

      {loading ? <LoadingState activeIndex={stepIndex} /> : null}

      {error ? (
        <Card className="border-rose-400/20 bg-rose-400/10 p-6">
          <h2 className="text-xl font-semibold text-rose-100">Audit could not be completed</h2>
          <p className="mt-3 text-rose-50/90">{error}</p>
        </Card>
      ) : null}

      {result ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-8"
        >
          <SummaryHeader
            metrics={result.data.metrics}
            insights={result.data.insights}
            model={process.env.NEXT_PUBLIC_APP_NAME ?? "Ollama"}
          />

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Factual Metrics</h2>
                <p className="mt-2 text-slate-400">Extracted from the page before any AI analysis.</p>
              </div>
            </div>
            <MetricsGrid metrics={result.data.metrics} />
            <div className="grid gap-4 lg:grid-cols-3">
              <MetadataCard metrics={result.data.metrics} />
              <LinkAnalysisCard metrics={result.data.metrics} />
              <ImageAnalysisCard metrics={result.data.metrics} />
            </div>
          </section>

          {hasInsights ? (
            <>
              <section className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">AI Insights</h2>
                  <p className="mt-2 text-slate-400">Grounded structured analysis using extracted facts and excerpts.</p>
                </div>
                <InsightsSection insights={result.data.insights!} />
              </section>

              <section className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Recommendations</h2>
                  <p className="mt-2 text-slate-400">3 to 5 prioritized actions tied to the extracted evidence.</p>
                </div>
                <RecommendationsSection recommendations={result.data.insights!.prioritizedRecommendations} />
              </section>
            </>
          ) : null}

          {result.data.warnings.length > 0 ? (
            <Card className="border-amber-400/20 bg-amber-400/10 p-6">
              <h2 className="text-xl font-semibold text-amber-100">Warnings</h2>
              <ul className="mt-3 space-y-2 text-amber-50/90">
                {result.data.warnings.map((warning) => (
                  <li key={warning}>• {warning}</li>
                ))}
              </ul>
            </Card>
          ) : null}

          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Prompt Logs</h2>
              <p className="mt-2 text-slate-400">System prompt, user prompt, structured input, raw output, and parsed result.</p>
            </div>
            <TracePanel trace={result.data.trace} />
          </section>
        </motion.div>
      ) : (
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-white">Ready for the first audit</h2>
          <p className="mt-3 text-slate-400">
            Enter a single URL to generate a premium report with factual metrics, AI insights, and prompt logs.
          </p>
        </Card>
      )}
    </div>
  );
}

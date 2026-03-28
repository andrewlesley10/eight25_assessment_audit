"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const steps = [
  "Fetching page",
  "Extracting structure",
  "Building AI input payload",
  "Generating grounded insights",
  "Finalizing report"
];

export function LoadingState({ activeIndex }: { activeIndex: number }) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <Badge tone="accent">Audit In Progress</Badge>
        <h2 className="text-xl font-semibold text-white">Preparing your report</h2>
      </div>
      <div className="grid gap-3">
        {steps.map((step, index) => {
          const state = index < activeIndex ? "done" : index === activeIndex ? "active" : "todo";
          return (
            <motion.div
              key={step}
              layout
              className={`flex items-center gap-4 rounded-2xl border px-4 py-4 ${
                state === "done"
                  ? "border-emerald-400/20 bg-emerald-400/10"
                  : state === "active"
                    ? "border-cobalt/30 bg-cobalt/10"
                    : "border-white/10 bg-white/5"
              }`}
            >
              <div
                className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold ${
                  state === "done"
                    ? "bg-emerald-400 text-slate-950"
                    : state === "active"
                      ? "bg-cobalt text-white"
                      : "bg-white/10 text-slate-300"
                }`}
              >
                {state === "done" ? "✓" : index + 1}
              </div>
              <div>
                <p className="font-medium text-white">{step}</p>
                <p className="text-sm text-slate-300">
                  {state === "done" ? "Completed" : state === "active" ? "In progress" : "Queued next"}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

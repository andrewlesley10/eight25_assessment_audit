"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PromptTrace } from "@/types/audit";

const tabs = [
  ["System Prompt", "systemPrompt"],
  ["User Prompt", "userPrompt"],
  ["Structured Input", "structuredInput"],
  ["Raw Output", "rawModelOutput"],
  ["Parsed Output", "parsedOutput"]
] as const;

export function TracePanel({ trace }: { trace: PromptTrace }) {
  const [active, setActive] = useState<(typeof tabs)[number][1]>("systemPrompt");

  const value =
    active === "parsedOutput" || active === "structuredInput"
      ? JSON.stringify(trace[active], null, 2)
      : String(trace[active] ?? "");

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Badge tone="accent">AI Trace</Badge>
            <h3 className="text-xl font-semibold text-white">Prompt transparency</h3>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            System prompt, user prompt, structured input, raw output, and parsed output.
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map(([label, key]) => (
          <Button
            key={key}
            variant={active === key ? "primary" : "secondary"}
            type="button"
            onClick={() => setActive(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      <pre className="max-h-[460px] overflow-auto rounded-3xl border border-white/10 bg-[#09111f] p-5 text-sm leading-7 text-slate-200">
        {value || "Unavailable"}
      </pre>
    </Card>
  );
}

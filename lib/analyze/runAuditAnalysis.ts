import { aiAuditSchema } from "@/lib/schemas/aiAuditSchema";
import { buildAuditPrompt } from "@/lib/prompts/buildAuditPrompt";
import { systemPrompt } from "@/lib/prompts/systemPrompt";
import { AuditError } from "@/lib/utils/errors";
import type { ExtractedMetrics, PromptTrace } from "@/types/audit";

function extractJsonObject(raw: string) {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new AuditError("The model did not return a valid JSON object.", "AI_FAILED");
  }

  return JSON.parse(trimmed.slice(start, end + 1));
}

export async function runAuditAnalysis(metrics: ExtractedMetrics) {
  const { userPrompt, promptConstruction } = buildAuditPrompt(metrics);
  const timestamp = new Date().toISOString();

  const response = await fetch(`${process.env.OLLAMA_BASE_URL ?? "http://localhost:11434"}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? "qwen2.5:7b",
      system: systemPrompt,
      prompt: userPrompt,
      stream: false,
      options: {
        temperature: 0.2
      }
    }),
    signal: AbortSignal.timeout(Number(process.env.OLLAMA_TIMEOUT_MS ?? 90_000))
  }).catch(() => {
    throw new AuditError("The Ollama request failed.", "AI_FAILED");
  });

  if (!response.ok) {
    throw new AuditError(`Ollama returned HTTP ${response.status}.`, "AI_FAILED");
  }

  const envelope = (await response.json()) as { response?: string };
  const rawModelOutput = envelope.response?.trim() ?? "";

  if (!rawModelOutput) {
    throw new AuditError("Ollama returned an empty response.", "AI_FAILED");
  }

  const parsedOutput = aiAuditSchema.parse(extractJsonObject(rawModelOutput));

  const trace: PromptTrace = {
    timestamp,
    url: metrics.finalUrl,
    systemPrompt,
    userPrompt,
    promptConstruction,
    structuredInput: metrics,
    rawModelOutput,
    parsedOutput
  };

  return {
    insights: parsedOutput,
    trace
  };
}

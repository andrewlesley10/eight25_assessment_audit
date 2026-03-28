import { aiAuditSchema } from "@/lib/schemas/aiAuditSchema";
import { buildAuditPrompt } from "@/lib/prompts/buildAuditPrompt";
import { systemPrompt } from "@/lib/prompts/systemPrompt";
import { AuditError } from "@/lib/utils/errors";
import type { ExtractedMetrics, PromptTrace } from "@/types/audit";

const defaultModelCandidates = [
  "qwen3:8b",
  "qwen3",
  "qwen3:latest",
  "glm-4.7:cloud",
  "gpt-oss:20b",
  "gpt-oss:120b"
];

function normalizeOllamaBaseUrl(rawBaseUrl: string) {
  const trimmed = rawBaseUrl.trim().replace(/\/+$/, "");

  if (!trimmed) {
    return "https://ollama.com/api";
  }

  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

function buildModelCandidates() {
  const envCandidates = [
    process.env.OLLAMA_MODEL,
    process.env.OLLAMA_MODEL_CANDIDATES
      ?.split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .join(",")
  ]
    .filter(Boolean)
    .flatMap((value) => value!.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set([...envCandidates, ...defaultModelCandidates])];
}

async function resolveModel(baseUrl: string, headers: HeadersInit) {
  const candidates = buildModelCandidates();

  try {
    const response = await fetch(`${baseUrl}/tags`, {
      headers,
      signal: AbortSignal.timeout(Number(process.env.OLLAMA_TIMEOUT_MS ?? 90_000))
    });

    if (!response.ok) {
      return candidates[0];
    }

    const payload = (await response.json()) as {
      models?: Array<{ name?: string; model?: string }>;
    };

    const available = new Set(
      (payload.models ?? [])
        .flatMap((model) => [model.name, model.model])
        .filter((value): value is string => Boolean(value))
        .map((value) => value.toLowerCase())
    );

    const matched = candidates.find((candidate) => available.has(candidate.toLowerCase()));
    return matched ?? candidates[0];
  } catch {
    return candidates[0];
  }
}

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
  const baseUrl = normalizeOllamaBaseUrl(process.env.OLLAMA_BASE_URL ?? "https://ollama.com");
  const apiKey = process.env.OLLAMA_API_KEY;

  if (!apiKey) {
    throw new AuditError("OLLAMA_API_KEY is required for Ollama Cloud.", "AI_FAILED");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`
  };
  const model = await resolveModel(baseUrl, headers);

  const response = await fetch(`${baseUrl}/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
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
    const details = (await response.text()).trim();
    const detailSuffix = details ? ` ${details.slice(0, 240)}` : "";

    if (response.status === 404) {
      throw new AuditError(
        `Ollama returned HTTP 404. Verify OLLAMA_BASE_URL (${baseUrl}) and OLLAMA_MODEL (${model}).${detailSuffix}`,
        "AI_FAILED"
      );
    }

    throw new AuditError(`Ollama returned HTTP ${response.status}.${detailSuffix}`, "AI_FAILED");
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

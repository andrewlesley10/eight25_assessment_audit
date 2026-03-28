import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { safeDomainForFilename } from "@/lib/utils/url";
import type { PromptTrace } from "@/types/audit";

function resolvePromptLogDirectory() {
  if (process.env.PROMPT_LOG_DIR) {
    return process.env.PROMPT_LOG_DIR;
  }

  if (process.env.VERCEL) {
    return "/tmp/prompt-logs";
  }

  return join(process.cwd(), "prompt-logs");
}

export async function writePromptLog(trace: PromptTrace) {
  const stamp = trace.timestamp.replace(/[:]/g, "-");
  const slug = safeDomainForFilename(trace.url);
  const directory = resolvePromptLogDirectory();
  const jsonPath = join(directory, `${stamp}_${slug}.json`);
  const markdownPath = join(directory, `${stamp}_${slug}.md`);

  await mkdir(directory, { recursive: true });

  await writeFile(jsonPath, JSON.stringify(trace, null, 2), "utf8");

  const markdown = `
# Prompt Trace

## System Prompt(s) Used
\`\`\`text
${trace.systemPrompt}
\`\`\`

## User Prompt(s)
\`\`\`text
${trace.userPrompt}
\`\`\`

## User Prompt(s) Were Constructed
\`\`\`json
${JSON.stringify(trace.promptConstruction, null, 2)}
\`\`\`

## Structured Inputs Sent to the Model
\`\`\`json
${JSON.stringify(trace.structuredInput, null, 2)}
\`\`\`

## Raw Model Outputs
\`\`\`text
${trace.rawModelOutput}
\`\`\`

## Parsed Output
\`\`\`json
${JSON.stringify(trace.parsedOutput, null, 2)}
\`\`\`
`.trim();

  await writeFile(markdownPath, `${markdown}\n`, "utf8");

  return { jsonPath, markdownPath };
}

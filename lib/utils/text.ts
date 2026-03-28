const CTA_PATTERN =
  /\b(contact|get started|book|schedule|request|demo|call|buy|start|subscribe|sign up|learn more|talk to us|download|see pricing)\b/i;

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function truncate(value: string, maxLength: number): string {
  const normalized = normalizeWhitespace(value);
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

export function countWords(value: string): number {
  const matches = normalizeWhitespace(value).match(/\b[\p{L}\p{N}'-]+\b/gu);
  return matches?.length ?? 0;
}

export function looksLikeCta(text: string, classHint?: string): boolean {
  const candidate = `${text} ${classHint ?? ""}`.trim();
  return CTA_PATTERN.test(candidate);
}

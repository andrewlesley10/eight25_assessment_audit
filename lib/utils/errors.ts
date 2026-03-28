import type { PromptTrace } from "@/types/audit";

export class AuditError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID_URL"
      | "FETCH_FAILED"
      | "NON_HTML"
      | "EMPTY_CONTENT"
      | "AI_FAILED" = "FETCH_FAILED",
    public readonly trace?: Partial<PromptTrace>
  ) {
    super(message);
  }
}

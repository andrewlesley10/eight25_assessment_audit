export class AuditError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID_URL"
      | "FETCH_FAILED"
      | "NON_HTML"
      | "EMPTY_CONTENT"
      | "AI_FAILED" = "FETCH_FAILED"
  ) {
    super(message);
  }
}

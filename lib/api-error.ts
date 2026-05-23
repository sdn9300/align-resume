/**
 * Standard API error envelope (architecture §10.3).
 * Helpers to build responses land in Phase 2+.
 */
export type ApiErrorCode =
  | "PARSE_FAILED"
  | "LLM_INVALID_JSON"
  | "GUARDRAIL_VIOLATION"
  | "RATE_LIMIT";

export type ApiErrorPayload = {
  error: {
    code: ApiErrorCode;
    message: string;
    stage: string;
    details?: string[];
  };
};

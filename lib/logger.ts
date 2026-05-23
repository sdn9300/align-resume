/** @see project_docs/architecture.md §15 */
export function logStage(entry: {
  runId: string;
  stage: string;
  durationMs: number;
  tokenUsage?: number;
  outcome: "ok" | "error";
}): void {
  const { runId, stage, durationMs, tokenUsage, outcome } = entry;

  const payload: Record<string, unknown> = {
    ts: new Date().toISOString(),
    runId,
    stage,
    durationMs,
    outcome,
  };
  if (tokenUsage !== undefined) {
    payload.tokenUsage = tokenUsage;
  }

  // In production this would go to a logging service
  console.log(`[pipeline] ${JSON.stringify(payload)}`);
}

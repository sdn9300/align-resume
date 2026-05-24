import { tailoringRunSchema, type TailoringRun } from "@/lib/schemas";

const STORAGE_PREFIX = "tailor-run:";

// ---------------------------------------------------------------------------
// Client-side sessionStorage helpers (used in browser)
// ---------------------------------------------------------------------------

export function isSessionStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = "__storage_test__";
    window.sessionStorage.setItem(key, key);
    window.sessionStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function saveTailoringRun(run: TailoringRun): void {
  if (!isSessionStorageAvailable()) return;
  window.sessionStorage.setItem(`${STORAGE_PREFIX}${run.id}`, JSON.stringify(run));
}

export function loadTailoringRun(runId: string): TailoringRun | null {
  if (!isSessionStorageAvailable()) return null;
  const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${runId}`);
  if (!raw) return null;

  try {
    const parsed = tailoringRunSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function generateRunId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `run-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Server-side in-memory store (API routes)
// Runs expire after 24 hours. Cleanup runs every 30 minutes.
// ---------------------------------------------------------------------------

const SERVER_RUN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const serverRuns = new Map<string, { run: TailoringRun; storedAt: number }>();

// Periodic cleanup of expired runs
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - SERVER_RUN_TTL_MS;
    for (const [id, entry] of serverRuns) {
      if (entry.storedAt < cutoff) serverRuns.delete(id);
    }
  }, 30 * 60 * 1000);
}

export function storeServerRun(run: TailoringRun): void {
  serverRuns.set(run.id, { run, storedAt: Date.now() });
}

export function getServerRun(runId: string): TailoringRun | undefined {
  const entry = serverRuns.get(runId);
  if (!entry) return undefined;

  // Check TTL on read
  if (Date.now() - entry.storedAt > SERVER_RUN_TTL_MS) {
    serverRuns.delete(runId);
    return undefined;
  }

  return entry.run;
}

export function getTTL(): number {
  return SERVER_RUN_TTL_MS;
}

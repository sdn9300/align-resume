import baseMock from "../public/fixtures/mock-run.json";
import {
  tailoringRunSchema,
  type JobDescriptionProfile,
  type TailoringRun,
} from "@/lib/schemas";
import { generateRunId } from "@/lib/run-storage";

type MockRunBase = Omit<TailoringRun, "id" | "createdAt">;

const mockBase = tailoringRunSchema
  .omit({ id: true, createdAt: true })
  .parse(baseMock) as MockRunBase;

function extractJobTitle(jdText: string): string | undefined {
  const firstLine = jdText.trim().split("\n")[0]?.trim();
  if (!firstLine || firstLine.length > 120) return undefined;
  return firstLine.replace(/\s*[—–-]\s*.+$/, "").trim() || firstLine;
}

function buildJobDescriptionFromText(
  jdText: string,
  fallback: JobDescriptionProfile,
): JobDescriptionProfile {
  const title = extractJobTitle(jdText);
  return {
    ...fallback,
    jobTitle: title ?? fallback.jobTitle,
    rawText: jdText.slice(0, 8000),
  };
}

/**
 * Creates a mock TailoringRun for Phase 1 UI/API prototyping.
 * Uses a rich fixture; overlays user paste text for audit fields only.
 */
export function createMockTailoringRun(
  resumeText: string,
  jdText: string,
  runId?: string,
): TailoringRun {
  const id = runId ?? generateRunId();

  const run: TailoringRun = {
    ...mockBase,
    id,
    createdAt: new Date().toISOString(),
    resume: {
      ...mockBase.resume,
      rawText: resumeText.slice(0, 8000),
    },
    jobDescription: buildJobDescriptionFromText(jdText, mockBase.jobDescription),
  };

  return tailoringRunSchema.parse(run);
}

/** In-memory store is now in lib/run-storage.ts */

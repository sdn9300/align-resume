import { z } from "zod";

import { completeStructured } from "@/lib/llm";
import {
  resumeGapSchema,
  type JobDescriptionProfile,
  type MatchScore,
  type ResumeGap,
  type ResumeProfile,
} from "@/lib/schemas";
import { buildGapAnalysisPrompt } from "@/prompts/gap-analysis";

const gapsResponseSchema = z.object({ gaps: z.array(resumeGapSchema) });

/** @see project_docs/architecture.md §6.5 */
export async function analyzeGaps(
  resume: ResumeProfile,
  jd: JobDescriptionProfile,
  match: MatchScore,
  runId?: string,
): Promise<ResumeGap[]> {
  const prompt = buildGapAnalysisPrompt(
    JSON.stringify(resume),
    JSON.stringify(jd),
    match.explanation,
  );

  const result = await completeStructured<{ gaps: ResumeGap[] }>({
    prompt,
    schema: gapsResponseSchema,
    runId,
    stage: "gap-analysis",
  });

  return result.gaps;
}

import { completeStructured } from "@/lib/llm";
import {
  matchScoreSchema,
  type JobDescriptionProfile,
  type MatchScore,
  type ResumeProfile,
} from "@/lib/schemas";
import { buildMatchScoringPrompt } from "@/prompts/match-scoring";

/** @see project_docs/architecture.md §6.3 */
export async function scoreResumeAgainstJd(
  resume: ResumeProfile,
  jd: JobDescriptionProfile,
  runId?: string,
): Promise<MatchScore> {
  const prompt = buildMatchScoringPrompt(
    JSON.stringify(resume),
    JSON.stringify(jd),
  );

  return completeStructured<MatchScore>({
    prompt,
    schema: matchScoreSchema,
    runId,
    stage: "match-score",
  });
}

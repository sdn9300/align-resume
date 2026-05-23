import { completeStructured } from "@/lib/llm";
import {
  jobDescriptionProfileSchema,
  type JobDescriptionProfile,
} from "@/lib/schemas";
import { buildJdExtractionPrompt } from "@/prompts/jd-extraction";

/** @see project_docs/architecture.md §6.2 */
export async function parseJobDescription(
  jdText: string,
  runId?: string,
): Promise<JobDescriptionProfile> {
  const prompt = buildJdExtractionPrompt(jdText);

  return completeStructured<JobDescriptionProfile>({
    prompt,
    schema: jobDescriptionProfileSchema,
    runId,
    stage: "parse-jd",
  });
}

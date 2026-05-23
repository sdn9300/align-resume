import { SYSTEM_TRUTHFULNESS_PREAMBLE } from "@/prompts/system-truthfulness";

/**
 * Prompt for analyzing gaps between resume and job description.
 * @see project_docs/architecture.md §7.1
 */
export function buildGapAnalysisPrompt(
  resumeJson: string,
  jdJson: string,
  matchExplanation: string,
): string {
  return `
${SYSTEM_TRUTHFULNESS_PREAMBLE}

Analyze the gaps between this resume and job description.
For each gap, determine:
- Can the candidate safely add or emphasize this? Only YES if there is concrete
  evidence in the resume to support it (e.g. a related skill, project, or bullet).
- Set canSafelyAdd to FALSE for completely missing experience.

Output ONLY valid JSON — an object with a single key "gaps" containing an array of objects matching:

{
  "gaps": [
    {
      "name": string,              // gap name (e.g. "Docker / containerization")
      "importance": "high" | "medium" | "low",
      "jdEvidence": string,        // quote from JD that creates this gap
      "resumeEvidence": string,    // what the resume shows (empty string if nothing)
      "suggestedAction": string,   // "interview_prep" | "add_if_true" | "mention_in_skills" | "leave_out"
      "canSafelyAdd": boolean      // true ONLY if resume has genuine supporting evidence
    }
  ]
}

RESUME (JSON):
${resumeJson}

JOB DESCRIPTION (JSON):
${jdJson}

MATCH EXPLANATION:
${matchExplanation}
`.trim();
}

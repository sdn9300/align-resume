import { SYSTEM_TRUTHFULNESS_PREAMBLE } from "@/prompts/system-truthfulness";

/**
 * Prompt for scoring a ResumeProfile against a JobDescriptionProfile.
 * @see project_docs/architecture.md §7.1
 */
export function buildMatchScoringPrompt(
  resumeJson: string,
  jdJson: string,
): string {
  return `
${SYSTEM_TRUTHFULNESS_PREAMBLE}

Score this resume against the job description. Be honest and critical.
Output ONLY valid JSON matching this TypeScript interface:

{
  "overallScore": number,           // 0-100, holistic match
  "skillCoverageScore": number,     // 0-100, how many required skills are met
  "responsibilityAlignmentScore": number, // 0-100, experience matches responsibilities
  "keywordScore": number,           // 0-100, keyword overlap
  "seniorityScore": number,         // 0-100, seniority alignment
  "criticalMissingRequirements": string[], // dealbreaker gaps
  "explanation": string,            // 2-3 sentence honest summary
  "evidence": [{
    "kind": "skill" | "bullet" | "requirement" | "keyword" | "seniority",
    "ref": string,                  // what matched or didn't
    "note": string | null            // context about the match
  }]
}

RESUME (JSON):
${resumeJson}

JOB DESCRIPTION (JSON):
${jdJson}
`.trim();
}

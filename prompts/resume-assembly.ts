import { SYSTEM_TRUTHFULNESS_PREAMBLE } from "@/prompts/system-truthfulness";

/**
 * Optional prompt for tailoring summary and reordering skills.
 * @see project_docs/architecture.md §7.1
 */
export function buildResumeAssemblyPrompt(args: {
  originalSummary: string;
  originalSkills: string[];
  jdJson: string;
  tailoredBulletsSummary?: string;
}): string {
  const { originalSummary, originalSkills, jdJson, tailoredBulletsSummary } = args;

  return `
${SYSTEM_TRUTHFULNESS_PREAMBLE}

Tailor the resume summary and skill list to better match the target job description.

Rules:
- Do NOT change facts. Keep the summary honest.
- Reorder skills to prioritize those most relevant to the JD.
- Only add a skill to the list if it's genuinely present in the original resume.
- The summary should reflect the candidate's actual experience, rephrased slightly.

Output ONLY valid JSON matching:

{
  "tailoredSummary": string,     // rewritten summary (1-2 sentences)
  "tailoredSkills": string[]     // reordered skill list
}

JOB DESCRIPTION (JSON):
${jdJson}

ORIGINAL SUMMARY:
${originalSummary}

ORIGINAL SKILLS:
${originalSkills.join(", ")}

${tailoredBulletsSummary ? `TAILORED BULLETS OVERVIEW:
${tailoredBulletsSummary}` : ""}
`.trim();
}

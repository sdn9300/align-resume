import { SYSTEM_TRUTHFULNESS_PREAMBLE } from "@/prompts/system-truthfulness";

/**
 * Prompt for rewriting experience bullets to better align with a JD.
 * Batched per experience entry (company + title).
 * @see project_docs/architecture.md §7.1
 */
export function buildBulletRewriterPrompt(args: {
  company: string;
  title: string;
  originalBullets: string[];
  jdJson: string;
  gapsJson: string;
}): string {
  const { company, title, originalBullets, jdJson, gapsJson } = args;

  return `
${SYSTEM_TRUTHFULNESS_PREAMBLE}

Rewrite the following resume bullets for the position of **${title} at ${company}**
to better align with the target job description.

Rules:
- Do NOT change job title, company, or dates.
- Do NOT invent new responsibilities, metrics, tools, or results.
- Do NOT fill gaps where canSafelyAdd is false.
- Rephrase to emphasize genuine alignment with JD keywords/requirements.
- If the original bullet already aligns well, return it largely unchanged.
- At most one bullet per original — no splitting or merging.

Output ONLY valid JSON — an object with a single key "rewrittenBullets" containing an array of objects matching:

{
  "rewrittenBullets": [
    {
      "original": string,            // exact original bullet text
      "tailored": string,            // rewritten version
      "changeReason": string,        // brief explanation of what changed and why
      "keywordsAddressed": string[], // JD keywords this rewrite connects to
      "confidence": "high" | "medium" | "low",
      "riskFlag": string | null      // set if any inference was made
    }
  ]
}

JOB DESCRIPTION (JSON):
${jdJson}

GAPS (JSON):
${gapsJson}

ORIGINAL BULLETS:
${originalBullets.map((b, i) => `[${i + 1}] ${b}`).join("\n")}
`.trim();
}

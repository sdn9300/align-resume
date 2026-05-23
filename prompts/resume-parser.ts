import { SYSTEM_TRUTHFULNESS_PREAMBLE } from "@/prompts/system-truthfulness";

/**
 * Prompt for LLM-based cleanup of ambiguous resume sections.
 * Only used when deterministic section splitting is not confident.
 * @see project_docs/architecture.md §7.1
 */
export function buildResumeCleanupPrompt(rawText: string): string {
  return `
${SYSTEM_TRUTHFULNESS_PREAMBLE}

Parse this resume text into a structured profile. Extract information as-is — do not rewrite, enhance, or embellish.
Output ONLY valid JSON matching this TypeScript interface:

{
  "contact": {
    "name": string | null,
    "email": string | null,
    "phone": string | null,
    "location": string | null,
    "links": string[]
  },
  "summary": string,
  "skills": string[],
  "experience": [{
    "company": string,
    "title": string,
    "startDate": string | null,    // date as written in resume
    "endDate": string | null,      // date as written in resume or "Present"
    "bullets": string[]
  }],
  "projects": [{
    "name": string,
    "description": string | null,
    "bullets": string[],
    "technologies": string[]
  }],
  "education": [{
    "school": string,
    "degree": string | null,
    "field": string | null,
    "startDate": string | null,
    "endDate": string | null
  }],
  "certifications": [{
    "name": string,
    "issuer": string | null,
    "date": string | null
  }]
}

For empty or absent sections use empty arrays. Preserve original wording in bullets.

RESUME TEXT:
${rawText}
`.trim();
}

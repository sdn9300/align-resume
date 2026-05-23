import { SYSTEM_TRUTHFULNESS_PREAMBLE } from "@/prompts/system-truthfulness";

/**
 * Prompt for extracting a structured JobDescriptionProfile from raw JD text.
 * @see project_docs/architecture.md §7.1
 */
export function buildJdExtractionPrompt(jdText: string): string {
  return `
${SYSTEM_TRUTHFULNESS_PREAMBLE}

Extract the following structured profile from this job description.
Output ONLY valid JSON matching this TypeScript interface:

{
  "jobTitle": string,              // extracted job title
  "company": string | null,        // company name if detectable
  "requiredSkills": string[],      // explicitly required skills/technologies
  "preferredSkills": string[],     // nice-to-have or preferred skills
  "responsibilities": string[],    // key responsibilities listed
  "qualifications": string[],      // education/years/experience requirements
  "tools": string[],               // tools, platforms, software mentioned
  "keywords": string[],            // important domain/buzzwords (10-20)
  "seniorityLevel": "intern" | "junior" | "mid" | "senior" | "staff" | "unknown",
  "domainSignals": string[]        // industry/domain indicators
}

If a field has no data, use an empty array or null — do not invent.

JOB DESCRIPTION:
${jdText}
`.trim();
}

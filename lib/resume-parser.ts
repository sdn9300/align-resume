import { completeStructured } from "@/lib/llm";
import {
  resumeProfileSchema,
  type ResumeProfile,
} from "@/lib/schemas";
import { buildResumeCleanupPrompt } from "@/prompts/resume-parser";

// ---------------------------------------------------------------------------
// 2.3.1 — Deterministic section splitter
// ---------------------------------------------------------------------------

const SECTION_HEADERS = [
  /^(?:summary|professional\s*summary|profile|about\s*me)\b/im,
  /^(?:skills|technical\s*skills|core\s*competencies|technologies)\b/im,
  /^(?:experience|work\s*experience|professional\s*experience|employment|career\s*history)\b/im,
  /^(?:education|academic|academic\s*background)\b/im,
  /^(?:projects|personal\s*projects|open\s*source)\b/im,
  /^(?:certifications|certificates|licenses)\b/im,
  /^(?:publications|patents|research)\b/im,
  /^(?:languages|volunteering|interests|references)\b/im,
];

interface SplitResult {
  summary?: string;
  skills?: string;
  experience?: string;
  education?: string;
  projects?: string;
  certifications?: string;
  other: string[];
  warnings: string[];
}

function splitIntoSections(rawText: string): SplitResult {
  const lines = rawText.split("\n");
  const sections: { header: string; content: string[] }[] = [];
  let currentHeader = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = SECTION_HEADERS.find((re) => re.test(trimmed));

    if (match && trimmed.length < 80) {
      if (currentHeader) {
        sections.push({ header: currentHeader, content: currentContent });
      }
      currentHeader = trimmed;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentHeader) {
    sections.push({ header: currentHeader, content: currentContent });
  }

  const result: SplitResult = {
    other: [],
    warnings: [],
  };

  for (const sec of sections) {
    const text = sec.content.join("\n").trim();
    const lower = sec.header.toLowerCase();

    if (/summary|professional\s*summary|profile/.test(lower)) {
      result.summary = text;
    } else if (/skills|technical\s*skills|core\s*competencies/.test(lower)) {
      result.skills = text;
    } else if (/experience|work\s*experience|professional\s*experience|employment/.test(lower)) {
      result.experience = text;
    } else if (/education|academic/.test(lower)) {
      result.education = text;
    } else if (/projects/.test(lower)) {
      result.projects = text;
    } else if (/certifications|certificates/.test(lower)) {
      result.certifications = text;
    } else {
      result.other.push(text);
    }
  }

  if (sections.length === 0) {
    result.warnings.push("No standard sections detected; all text treated as raw.");
    result.other.push(rawText);
  }

  return result;
}

// ---------------------------------------------------------------------------
// 2.3.2 — Simple heuristic parse from split sections (no LLM)
// ---------------------------------------------------------------------------

interface RawContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
}

function extractContact(rawText: string): RawContactInfo {
  const contact: RawContactInfo = {};

  // Email
  const emailMatch = rawText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (emailMatch) contact.email = emailMatch[0];

  // Phone (simple patterns)
  const phoneMatch = rawText.match(
    /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
  );
  if (phoneMatch) contact.phone = phoneMatch[0];

  // First line of raw text often contains name
  const firstLine = rawText.trim().split("\n")[0]?.trim();
  if (firstLine && firstLine.length < 60) {
    contact.name = firstLine;
  }

  return contact;
}

function parseSkillsLine(text: string): string[] {
  // Split by common separators: comma, pipe, bullet
  return text
    .split(/[,|•·\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 50);
}

function parseExperienceBlock(text: string): ResumeProfile["experience"] {
  // Simple heuristic: lines that look like job entries
  // In a full implementation, this would use more sophisticated parsing
  const lines = text.split("\n").filter((l) => l.trim());
  const entries: ResumeProfile["experience"] = [];

  let currentCompany = "";
  let currentTitle = "";
  let currentBullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Bullet point (starts with -, •, *, or numbered)
    if (/^[\-•*\d+\.]\s/.test(trimmed)) {
      currentBullets.push(trimmed.replace(/^[\-•*\d+\.]\s*/, "").trim());
    } else if (currentCompany && trimmed.length > 0) {
      // If we already have a company and this looks like a new entry
      // This is simplistic — real parsing would use date patterns, etc.
      if (currentBullets.length > 0) {
        entries.push({
          company: currentCompany,
          title: currentTitle,
          bullets: currentBullets,
        });
      }
      currentCompany = trimmed;
      currentTitle = "";
      currentBullets = [];
    } else {
      currentCompany = trimmed;
    }
  }

  // Push last entry
  if (currentCompany && currentBullets.length > 0) {
    entries.push({
      company: currentCompany,
      title: currentTitle || currentCompany,
      bullets: currentBullets,
    });
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** @see project_docs/architecture.md §6.1 */
export async function parseResumeInput(
  rawText: string,
  runId?: string,
): Promise<ResumeProfile> {
  const contact = extractContact(rawText);

  // Try deterministic parsing first
  const sections = splitIntoSections(rawText);

  if (sections.warnings.length > 0) {
    // Sections ambiguous — use LLM cleanup
    try {
      const llmResult = await completeStructured<ResumeProfile>({
        prompt: buildResumeCleanupPrompt(rawText),
        schema: resumeProfileSchema,
        runId,
        stage: "parse-resume",
      });
      return resumeProfileSchema.parse({
        ...llmResult,
        rawText,
        parseWarnings: sections.warnings,
      });
    } catch {
      // Fall through to deterministic fallback
    }
  }

  // Build profile from deterministic parsing
  const skills = sections.skills ? parseSkillsLine(sections.skills) : [];
  const experience = sections.experience
    ? parseExperienceBlock(sections.experience)
    : [];

  // For education, projects, certs — use LLM on those specific sections if available
  // For now, simplified deterministic parse

  const profile: ResumeProfile = {
    contact: {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      location: contact.location,
    },
    summary: sections.summary || "",
    skills,
    experience,
    education: [],
    projects: [],
    certifications: [],
    rawText,
    parseWarnings:
      sections.warnings.length > 0 ? sections.warnings : undefined,
  };

  return resumeProfileSchema.parse(profile);
}

import { z } from "zod";

import { completeStructured } from "@/lib/llm";
import {
  resumeProfileSchema,
  tailoredBulletSchema,
  type JobDescriptionProfile,
  type ResumeGap,
  type ResumeProfile,
  type TailoredBullet,
  type TailoredResume,
} from "@/lib/schemas";
import { buildBulletRewriterPrompt } from "@/prompts/bullet-rewriter";

const MAX_BULLETS_PER_RUN = 20;

const bulletResponseSchema = z.object({ rewrittenBullets: z.array(tailoredBulletSchema) });

/** @see project_docs/architecture.md §6.4 */
export async function tailorResume(
  resume: ResumeProfile,
  jd: JobDescriptionProfile,
  gaps: ResumeGap[],
  runId?: string,
): Promise<TailoredResume> {
  const jdJson = JSON.stringify(jd);
  const gapsJson = JSON.stringify(gaps);

  let totalBullets = 0;
  const tailoredExperience = [];

  // Process each experience entry in parallel (batched per company/title)
  const batches = resume.experience.map(async (entry) => {
    if (totalBullets >= MAX_BULLETS_PER_RUN) {
      return null;
    }

    const cappedBullets = entry.bullets.slice(
      0,
      MAX_BULLETS_PER_RUN - totalBullets,
    );
    totalBullets += cappedBullets.length;

    const prompt = buildBulletRewriterPrompt({
      company: entry.company,
      title: entry.title,
      originalBullets: cappedBullets,
      jdJson,
      gapsJson,
    });

    const rewrittenResponse = await completeStructured<{ rewrittenBullets: TailoredBullet[] }>({
      prompt,
      schema: bulletResponseSchema,
      runId,
      stage: `tailor-${entry.company}`,
    });

    return {
      company: entry.company,
      title: entry.title,
      startDate: entry.startDate,
      endDate: entry.endDate,
      bullets: rewrittenResponse.rewrittenBullets,
    };
  });

  const results = await Promise.all(batches);

  for (const r of results) {
    if (r !== null) {
      tailoredExperience.push(r);
    }
  }

  // Simple assembly: use original summary/skills, can enhance with resume-assembly prompt later
  const tailoredResume: TailoredResume = {
    tailoredSummary: resume.summary,
    tailoredSkills: [...resume.skills],
    tailoredExperience,
    tailoredProjects: resume.projects.length > 0
      ? resume.projects.map((p) => ({
          name: p.name,
          description: p.description,
          bullets: p.bullets.map((b) => ({
            original: b,
            tailored: b,
            changeReason: "Unchanged — project bullet",
            keywordsAddressed: [],
            confidence: "high" as const,
          })),
          technologies: p.technologies,
        }))
      : undefined,
    unchangedSections: [],
  };

  return tailoredResume;
}

/**
 * Convert a TailoredResume back into a ResumeProfile shape for rescoring.
 * Preserves unchanged fields from the original.
 * @see project_docs/architecture.md §6.4
 */
export function tailoredResumeToProfile(
  tailored: TailoredResume,
  original: ResumeProfile,
): ResumeProfile {
  // Extract the tailored text from each bullet for rescoring
  const experience = tailored.tailoredExperience.map((entry) => ({
    company: entry.company,
    title: entry.title,
    startDate: entry.startDate,
    endDate: entry.endDate,
    bullets: entry.bullets.map((b) => b.tailored),
  }));

  return resumeProfileSchema.parse({
    contact: original.contact,
    summary: tailored.tailoredSummary,
    skills: tailored.tailoredSkills,
    experience,
    projects: tailored.tailoredProjects
      ? tailored.tailoredProjects.map((p) => ({
          name: p.name,
          description: p.description,
          bullets: p.bullets.map((b) => b.tailored),
          technologies: p.technologies,
        }))
      : original.projects,
    education: original.education,
    certifications: original.certifications,
    rawText: original.rawText,
  });
}

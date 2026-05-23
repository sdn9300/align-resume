import { generateRunId, storeServerRun } from "@/lib/run-storage";
import {
  tailoringRunSchema,
  type ResumeProfile,
  type TailoringRun,
} from "@/lib/schemas";
import { validateTailoredResume } from "./guardrails";
import { analyzeGaps } from "./gaps";
import { parseJobDescription } from "./jd-parser";
import { parseResumeInput } from "./resume-parser";
import { scoreResumeAgainstJd } from "./scoring";
import { tailorResume, tailoredResumeToProfile } from "./tailoring";

/**
 * Run the full pipeline synchronously.
 * Status transitions: pending → parsing → analyzing → tailoring → complete
 *
 * @see project_docs/architecture.md §6.7
 */
export async function runPipeline(input: {
  resumeText: string;
  jdText: string;
}): Promise<TailoringRun> {
  const runId = generateRunId();
  const createdAt = new Date().toISOString();

  // Accumulate partial data and errors for graceful degradation
  let resume: ResumeProfile | null = null;

  const run: TailoringRun = {
    id: runId,
    createdAt,
    status: "pending",
    resume: {
      contact: {},
      summary: "",
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
    },
    jobDescription: {
      jobTitle: "",
      seniorityLevel: "unknown",
      requiredSkills: [],
      preferredSkills: [],
      responsibilities: [],
      qualifications: [],
      tools: [],
      keywords: [],
      domainSignals: [],
    },
    originalMatch: {
      overallScore: 0,
      skillCoverageScore: 0,
      responsibilityAlignmentScore: 0,
      keywordScore: 0,
      seniorityScore: 0,
      criticalMissingRequirements: [],
      explanation: "",
    },
  };

  try {
    // ---- Stage 1: Parse resume ----
    run.status = "parsing";
    resume = await parseResumeInput(input.resumeText, runId);
    run.resume = resume;

    // ---- Stage 2: Parse JD ----
    run.jobDescription = await parseJobDescription(input.jdText, runId);

    // ---- Stage 3: Original match scoring ----
    run.originalMatch = await scoreResumeAgainstJd(
      run.resume,
      run.jobDescription,
      runId,
    );

    // ---- Stage 4: Gap analysis ----
    run.gaps = await analyzeGaps(
      run.resume,
      run.jobDescription,
      run.originalMatch,
      runId,
    );

    // ---- Stage 5: Tailor ----
    run.status = "tailoring";
    run.tailoredResume = await tailorResume(
      run.resume,
      run.jobDescription,
      run.gaps ?? [],
      runId,
    );

    // ---- Stage 6: Guardrail validation ----
    if (run.tailoredResume) {
      const guardrailResult = validateTailoredResume(run.resume, run.tailoredResume);
      run.guardrailWarnings = guardrailResult.warnings;
    }

    // ---- Stage 7: Tailored match scoring ----
    const tailoredProfile = tailoredResumeToProfile(run.tailoredResume, run.resume);
    run.tailoredMatch = await scoreResumeAgainstJd(
      tailoredProfile,
      run.jobDescription,
      runId,
    );

    // ---- Complete ----
    run.status = "complete";
  } catch (err) {
    run.status = "failed";
    const message = err instanceof Error ? err.message : "Unknown pipeline error";
    run.errors = [...(run.errors || []), message];
  }

  // Ensure the run always validates, even with partial data
  const validated = tailoringRunSchema.parse(run);
  storeServerRun(validated);
  return validated;
}

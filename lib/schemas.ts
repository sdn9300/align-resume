import { z } from "zod";

/** Shared helper: ISO date string or free-form date text from resumes */
const dateLike = z.string();

/** Resilient string helper that safely maps null, undefined, or missing values to empty strings */
const resilientString = z.string().or(z.null()).optional().transform((v) => v ?? "");

/** Resilient optional string helper that safely maps null, undefined, or missing values to undefined */
const resilientOptionalString = z.string().or(z.null()).optional().transform((v) => v ?? undefined);

export const seniorityLevelSchema = z.enum([
  "intern",
  "junior",
  "mid",
  "senior",
  "staff",
  "unknown",
]);

export const tailoringRunStatusSchema = z.enum([
  "pending",
  "parsing",
  "analyzing",
  "tailoring",
  "complete",
  "failed",
]);

export const confidenceSchema = z.enum(["high", "medium", "low"]);

export const gapImportanceSchema = z.enum(["high", "medium", "low"]);

export const contactSchema = z.object({
  name: resilientOptionalString,
  email: resilientOptionalString,
  phone: resilientOptionalString,
  location: resilientOptionalString,
  links: z.array(z.string()).optional(),
});

export const experienceEntrySchema = z.object({
  company: resilientString,
  title: resilientString,
  startDate: dateLike.optional(),
  endDate: dateLike.optional(),
  bullets: z.array(z.string()),
});

export const projectEntrySchema = z.object({
  name: resilientString,
  description: resilientOptionalString,
  bullets: z.array(z.string()).default([]),
  technologies: z.array(z.string()).optional(),
});

export const educationEntrySchema = z.object({
  school: resilientString,
  degree: resilientOptionalString,
  field: resilientOptionalString,
  startDate: dateLike.optional(),
  endDate: dateLike.optional(),
});

export const certificationEntrySchema = z.object({
  name: resilientString,
  issuer: resilientOptionalString,
  date: dateLike.optional(),
});

export const resumeProfileSchema = z.object({
  contact: contactSchema.default({}),
  summary: z.string().default(""),
  skills: z.array(z.string()).default([]),
  experience: z.array(experienceEntrySchema).default([]),
  projects: z.array(projectEntrySchema).default([]),
  education: z.array(educationEntrySchema).default([]),
  certifications: z.array(certificationEntrySchema).default([]),
  rawText: z.string().optional(),
  parseWarnings: z.array(z.string()).optional(),
});

export const jobDescriptionProfileSchema = z.object({
  jobTitle: resilientString,
  company: resilientOptionalString,
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  qualifications: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  seniorityLevel: seniorityLevelSchema,
  domainSignals: z.array(z.string()).default([]),
  rawText: z.string().optional(),
});

export const matchEvidenceSchema = z.object({
  kind: z.enum([
    "skill",
    "bullet",
    "requirement",
    "keyword",
    "seniority",
    "responsibility",
    "experience",
    "project",
    "education",
    "certification",
  ]),
  ref: z.string(),
  note: z.string().nullable().optional(),
});

const score0to100 = z.number().min(0).max(100);

export const matchScoreSchema = z.object({
  overallScore: score0to100,
  skillCoverageScore: score0to100,
  responsibilityAlignmentScore: score0to100,
  keywordScore: score0to100,
  seniorityScore: score0to100,
  criticalMissingRequirements: z.array(z.string()).default([]),
  explanation: z.string(),
  evidence: z.array(matchEvidenceSchema).optional(),
});

export const tailoredBulletSchema = z.object({
  original: z.string(),
  tailored: z.string(),
  changeReason: z.string(),
  keywordsAddressed: z.array(z.string()).default([]),
  confidence: confidenceSchema,
  riskFlag: z.string().nullable().optional(),
  userConfirmed: z.boolean().optional(),
});

export const tailoredExperienceEntrySchema = z.object({
  company: resilientString,
  title: resilientString,
  startDate: dateLike.optional(),
  endDate: dateLike.optional(),
  bullets: z.array(tailoredBulletSchema),
});

export const tailoredProjectEntrySchema = z.object({
  name: resilientString,
  description: resilientOptionalString,
  bullets: z.array(tailoredBulletSchema),
  technologies: z.array(z.string()).optional(),
});

export const tailoredResumeSchema = z.object({
  tailoredSummary: z.string(),
  tailoredSkills: z.array(z.string()).default([]),
  tailoredExperience: z.array(tailoredExperienceEntrySchema).default([]),
  tailoredProjects: z.array(tailoredProjectEntrySchema).optional(),
  unchangedSections: z.array(z.string()).optional(),
});

export const resumeGapSchema = z.object({
  name: z.string(),
  importance: gapImportanceSchema,
  jdEvidence: z.string(),
  resumeEvidence: z.string(),
  suggestedAction: z.string(),
  canSafelyAdd: z.boolean(),
});

export const guardrailWarningSchema = z.object({
  type: z.enum([
    "new_employer",
    "new_school",
    "new_cert",
    "new_metric",
    "new_skill",
    "keyword_spike",
    "seniority_inflation",
  ]),
  severity: z.enum(["error", "warning"]),
  message: z.string(),
  detail: z.string().optional(),
});

export const tailoringRunSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  status: tailoringRunStatusSchema,
  resume: resumeProfileSchema,
  jobDescription: jobDescriptionProfileSchema,
  originalMatch: matchScoreSchema,
  tailoredMatch: matchScoreSchema.optional(),
  tailoredResume: tailoredResumeSchema.optional(),
  gaps: z.array(resumeGapSchema).optional(),
  guardrailWarnings: z.array(guardrailWarningSchema).optional(),
  errors: z.array(z.string()).optional(),
});

export type SeniorityLevel = z.infer<typeof seniorityLevelSchema>;
export type TailoringRunStatus = z.infer<typeof tailoringRunStatusSchema>;
export type Confidence = z.infer<typeof confidenceSchema>;
export type GapImportance = z.infer<typeof gapImportanceSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type CertificationEntry = z.infer<typeof certificationEntrySchema>;
export type ResumeProfile = z.infer<typeof resumeProfileSchema>;
export type JobDescriptionProfile = z.infer<typeof jobDescriptionProfileSchema>;
export type MatchEvidence = z.infer<typeof matchEvidenceSchema>;
export type MatchScore = z.infer<typeof matchScoreSchema>;
export type TailoredBullet = z.infer<typeof tailoredBulletSchema>;
export type TailoredExperienceEntry = z.infer<typeof tailoredExperienceEntrySchema>;
export type TailoredProjectEntry = z.infer<typeof tailoredProjectEntrySchema>;
export type TailoredResume = z.infer<typeof tailoredResumeSchema>;
export type ResumeGap = z.infer<typeof resumeGapSchema>;
export type GuardrailWarning = z.infer<typeof guardrailWarningSchema>;
export type TailoringRun = z.infer<typeof tailoringRunSchema>;

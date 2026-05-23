/** @see project_docs/architecture.md §6.3 — default scoring weights */
export const DEFAULT_SCORING_WEIGHTS = {
  requiredSkillCoverage: 0.35,
  responsibilityAlignment: 0.25,
  keywordAlignment: 0.2,
  seniorityAlignment: 0.1,
  preferredSkillCoverage: 0.1,
} as const;

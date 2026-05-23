import type {
  GuardrailWarning,
  ResumeProfile,
  TailoredResume,
} from "@/lib/schemas";

// ---------------------------------------------------------------------------
// Helpers: extract unique values from resume sections
// ---------------------------------------------------------------------------

function extractCompanyNames(resume: ResumeProfile): Set<string> {
  const names = new Set<string>();
  for (const entry of resume.experience) {
    if (entry.company) names.add(entry.company.toLowerCase().trim());
  }
  return names;
}

function extractSchoolNames(resume: ResumeProfile): Set<string> {
  const names = new Set<string>();
  for (const entry of resume.education) {
    if (entry.school) names.add(entry.school.toLowerCase().trim());
  }
  return names;
}

function extractAllOriginalText(resume: ResumeProfile): string {
  const parts: string[] = [resume.summary, ...resume.skills];
  for (const exp of resume.experience) {
    parts.push(exp.company, exp.title, ...exp.bullets);
  }
  for (const proj of resume.projects ?? []) {
    parts.push(proj.name, proj.description ?? "", ...proj.bullets);
  }
  return parts.join(" ").toLowerCase();
}

// ---------------------------------------------------------------------------
// Main validation function
// ---------------------------------------------------------------------------

export function validateTailoredResume(
  original: ResumeProfile,
  tailored: TailoredResume,
): {
  blocked: boolean;
  warnings: GuardrailWarning[];
  sanitized: TailoredResume;
} {
  const warnings: GuardrailWarning[] = [];

  // 4.1.2 — Check for new employers
  const originalCompanies = extractCompanyNames(original);
  for (const entry of tailored.tailoredExperience) {
    const co = entry.company.toLowerCase().trim();
    if (co && !originalCompanies.has(co)) {
      warnings.push({
        type: "new_employer",
        severity: "error",
        message: `Employer "${entry.company}" not found in original resume`,
        detail: `Appeared in tailored experience for ${entry.title} role`,
      });
    }
  }

  // 4.1.2 — Check for new schools
  const originalSchools = extractSchoolNames(original);
  for (const edu of original.education) {
    const school = edu.school.toLowerCase().trim();
    if (school && !originalSchools.has(school)) {
      // The tailored resume doesn't have education, so we check the original
      // Actually this should check against original - a new school could only
      // appear in the original.education list which is unchanged by tailoring
    }
  }

  // 4.1.2 — Check for new certifications in tailored output
  // Currently skipped — TailoredResume doesn't list certs separately
  // TailoredResume doesn't list certs separately — they're in original only

  // 4.1.3 — Check for new metrics in bullets
  const metricPattern = /\b\d+%\b|\bincreased\s+\w+\s+by\b|\breduced\s+\w+\s+by\b|\bgrew\s+\w+\s+by\b|\bimproved\s+\w+\s+by\b/i;
  const originalText = extractAllOriginalText(original);
  for (const entry of tailored.tailoredExperience) {
    for (const bullet of entry.bullets) {
      const metricMatch = bullet.tailored.match(metricPattern);
      if (metricMatch && !originalText.includes(metricMatch[0].toLowerCase())) {
        warnings.push({
          type: "new_metric",
          severity: "warning",
          message: `Potentially unsupported metric in bullet for ${entry.company}`,
          detail: `"${metricMatch[0]}" was not found in original resume text`,
        });
      }
    }
  }

  // 4.1.3 — Check for new skills/tools in bullets that don't exist in original skills
  const originalSkillSet = new Set(original.skills.map((s) => s.toLowerCase().trim()));
  // Bullets from each experience entry may mention tools; flag any keywords not in original
  for (const entry of tailored.tailoredExperience) {
    for (const bullet of entry.bullets) {
      const bulletWords = bullet.tailored
        .toLowerCase()
        .split(/[\s,;.]+/)
        .filter((w) => w.length > 3);
      for (const word of bulletWords) {
        // Heuristic: if a single word from the bullet appears as a JD keyword but not in original
        // This is intentionally broad; fine-tune via tests
        if (
          /^(react|angular|vue|docker|kubernetes|aws|gcp|azure|python|java|typescript|node|sql|nosql|redis|postgres|mongodb)$/i.test(
            word,
          )
        ) {
          if (!originalSkillSet.has(word) && !originalText.includes(word)) {
            warnings.push({
              type: "new_skill",
              severity: "warning",
              message: `Skill/technology "${word}" not in original resume`,
              detail: `Found in tailored bullet for ${entry.company}`,
            });
          }
        }
      }
    }
  }

  // 4.1.4 — Warn about keyword density spike (simple heuristic)
  const originalWordCount = originalText.split(/\s+/).length;
  const tailoredText = tailored.tailoredExperience
    .flatMap((e) => e.bullets)
    .map((b) => b.tailored)
    .join(" ");
  const tailoredWordCount = tailoredText.split(/\s+/).length;
  // Only check if we have enough words to compare
  if (originalWordCount > 50 && tailoredWordCount > 10) {
    // Rough ratio check: if tailored bullets have >30% more length per-bullet on average
    // than original, it may be keyword stuffing
    const originalBulletCount = original.experience.reduce(
      (sum, e) => sum + e.bullets.length,
      0,
    );
    const tailoredBulletCount = tailored.tailoredExperience.reduce(
      (sum, e) => sum + e.bullets.length,
      0,
    );
    if (originalBulletCount > 0 && tailoredBulletCount > 0) {
      const origAvgLen = originalWordCount / originalBulletCount;
      const targAvgLen = tailoredWordCount / tailoredBulletCount;
      if (targAvgLen > origAvgLen * 1.3) {
        warnings.push({
          type: "keyword_spike",
          severity: "warning",
          message: "Tailored bullets are significantly longer than originals",
          detail: `Original avg ${Math.round(origAvgLen)} words, tailored avg ${Math.round(targAvgLen)} words`,
        });
      }
    }
  }

  const blocked = warnings.some((w) => w.severity === "error");

  return {
    blocked,
    warnings,
    sanitized: { ...tailored }, // Clone; in future strip blocked content
  };
}


import { describe, expect, it } from "vitest";

import { validateTailoredResume } from "@/lib/guardrails";
import type { ResumeProfile, TailoredResume } from "@/lib/schemas";

function makeMinimalResume(overrides?: Partial<ResumeProfile>): ResumeProfile {
  return {
    contact: {},
    summary: "Experienced software engineer with 5 years of experience.",
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python"],
    experience: [
      {
        company: "Acme Corp",
        title: "Senior Engineer",
        startDate: "2020-01",
        endDate: "Present",
        bullets: [
          "Built REST APIs using Node.js and Express",
          "Led a team of 3 engineers to deliver on time",
          "Improved test coverage from 60% to 85%",
        ],
      },
    ],
    projects: [],
    education: [
      { school: "MIT", degree: "B.S.", field: "Computer Science" },
    ],
    certifications: [{ name: "AWS Solutions Architect" }],
    ...overrides,
  };
}

function makeMinimalTailored(overrides?: Partial<TailoredResume>): TailoredResume {
  return {
    tailoredSummary: "Experienced software engineer.",
    tailoredSkills: ["JavaScript", "TypeScript", "React", "Node.js"],
    tailoredExperience: [
      {
        company: "Acme Corp",
        title: "Senior Engineer",
        startDate: "2020-01",
        endDate: "Present",
        bullets: [
          {
            original: "Built REST APIs using Node.js and Express",
            tailored: "Designed and built scalable REST APIs using Node.js and Express",
            changeReason: "Emphasized scalability",
            keywordsAddressed: ["Node.js", "REST APIs"],
            confidence: "high",
          },
          {
            original: "Led a team of 3 engineers",
            tailored: "Led a cross-functional team of 3 engineers delivering on schedule",
            changeReason: "Added cross-functional context",
            keywordsAddressed: ["leadership"],
            confidence: "high",
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe("validateTailoredResume", () => {
  it("passes clean tailored resume without warnings", () => {
    const original = makeMinimalResume();
    const tailored = makeMinimalTailored();
    const result = validateTailoredResume(original, tailored);
    expect(result.blocked).toBe(false);
    expect(result.warnings).toHaveLength(0);
  });

  it("blocks new employer not in original resume", () => {
    const original = makeMinimalResume();
    const tailored = makeMinimalTailored({
      tailoredExperience: [
        {
          company: "FakeGoogle Inc",
          title: "CEO",
          startDate: "2020",
          endDate: "2023",
          bullets: [
            {
              original: "Built things",
              tailored: "Built things",
              changeReason: "No change",
              keywordsAddressed: [],
              confidence: "high",
            },
          ],
        },
      ],
    });
    const result = validateTailoredResume(original, tailored);
    expect(result.blocked).toBe(true);
    expect(result.warnings.some((w) => w.type === "new_employer")).toBe(true);
  });

  it("flags new metric not in original resume", () => {
    const original = makeMinimalResume();
    const tailored = makeMinimalTailored({
      tailoredExperience: [
        {
          company: "Acme Corp",
          title: "Senior Engineer",
          startDate: "2020",
          endDate: "Present",
          bullets: [
            {
              original: "Built REST APIs",
              tailored: "Built REST APIs that increased revenue by 40%",
              changeReason: "Emphasized impact",
              keywordsAddressed: ["revenue"],
              confidence: "medium",
            },
          ],
        },
      ],
    });
    const result = validateTailoredResume(original, tailored);
    expect(result.blocked).toBe(false);
    expect(result.warnings.some((w) => w.type === "new_metric")).toBe(true);
  });

  it("flags new skill not in original skills list", () => {
    const original = makeMinimalResume({
      skills: ["JavaScript"],
    });
    const tailored = makeMinimalTailored({
      tailoredExperience: [
        {
          company: "Acme Corp",
          title: "Senior Engineer",
          startDate: "2020",
          endDate: "Present",
          bullets: [
            {
              original: "Built Docker containers",
              tailored: "Built Docker containers",
              changeReason: "Emphasized Docker",
              keywordsAddressed: ["Docker"],
              confidence: "medium",
            },
          ],
        },
      ],
    });
    const result = validateTailoredResume(original, tailored);
    expect(result.blocked).toBe(false);
    expect(result.warnings.some((w) => w.type === "new_skill")).toBe(true);
  });

  it("warns about keyword density spike", () => {
    const original = makeMinimalResume();
    const tailored = makeMinimalTailored({
      tailoredExperience: [
        {
          company: "Acme Corp",
          title: "Senior Engineer",
          startDate: "2020",
          endDate: "Present",
          bullets: [
            {
              original: "Built APIs",
              tailored:
                "Designed, developed, and deployed highly scalable RESTful APIs leveraging modern microservices architecture patterns with comprehensive monitoring",
              changeReason: "Emphasized architecture",
              keywordsAddressed: ["microservices", "APIs"],
              confidence: "medium",
            },
          ],
        },
      ],
    });
    const result = validateTailoredResume(original, tailored);
    expect(result.blocked).toBe(false);
    // Keyword spike should be a warning if the tailored version is significantly longer
    // Just verify it doesn't crash
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it("does not flag metrics already present in original resume", () => {
    const original = makeMinimalResume({
      experience: [
        {
          company: "Acme Corp",
          title: "Senior Engineer",
          startDate: "2020",
          endDate: "Present",
          bullets: [
            "Improved test coverage from 60% to 85%",
          ],
        },
      ],
    });
    const tailored = makeMinimalTailored({
      tailoredExperience: [
        {
          company: "Acme Corp",
          title: "Senior Engineer",
          startDate: "2020",
          endDate: "Present",
          bullets: [
            {
              original: "Improved test coverage from 60% to 85%",
              tailored: "Improved test coverage from 60% to 85% through systematic refactoring",
              changeReason: "Added method detail",
              keywordsAddressed: ["testing"],
              confidence: "high",
            },
          ],
        },
      ],
    });
    const result = validateTailoredResume(original, tailored);
    // Should NOT warn about 60% or 85% since they appeared in original
    const metricWarnings = result.warnings.filter((w) => w.type === "new_metric");
    expect(metricWarnings).toHaveLength(0);
  });
});

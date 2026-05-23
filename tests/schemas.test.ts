import { describe, expect, it } from "vitest";

import { createMockTailoringRun } from "@/lib/mock-run";
import { tailoringRunSchema } from "@/lib/schemas";

import validRun from "./fixtures/valid-minimal-tailoring-run.json";

describe("tailoringRunSchema", () => {
  it("parses the golden fixture", () => {
    const parsed = tailoringRunSchema.safeParse(validRun);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid payloads", () => {
    const parsed = tailoringRunSchema.safeParse({
      id: "bad",
      status: "not-a-real-status",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("createMockTailoringRun", () => {
  it("returns a valid TailoringRun with 3+ bullets and 4+ gaps", () => {
    const run = createMockTailoringRun("x".repeat(60), "y".repeat(100), "test-run-id");
    expect(tailoringRunSchema.safeParse(run).success).toBe(true);
    expect(run.id).toBe("test-run-id");

    const bulletCount = run.tailoredResume?.tailoredExperience.reduce(
      (n, e) => n + e.bullets.length,
      0,
    );
    expect(bulletCount).toBeGreaterThanOrEqual(3);
    expect(run.gaps?.length ?? 0).toBeGreaterThanOrEqual(4);
  });
});

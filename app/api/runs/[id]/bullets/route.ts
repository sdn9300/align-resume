import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerRun, storeServerRun } from "@/lib/run-storage";

const patchBodySchema = z.object({
  experience: z.array(
    z.object({
      company: z.string(),
      title: z.string(),
      bullets: z.array(
        z.object({
          index: z.number().int().min(0),
          tailored: z.string().optional(),
          userConfirmed: z.boolean().optional(),
        }),
      ),
    }),
  ),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const run = getServerRun(id);
  if (!run) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Run not found", stage: "api/runs/[id]/bullets" } },
      { status: 404 },
    );
  }

  if (!run.tailoredResume) {
    return NextResponse.json(
      { error: { code: "NO_TAILORED_DATA", message: "No tailored resume to edit", stage: "api/runs/[id]/bullets" } },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await _request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Request body must be valid JSON", stage: "api/runs/[id]/bullets" } },
      { status: 400 },
    );
  }

  const parsed = patchBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid patch body",
          stage: "api/runs/[id]/bullets",
          detail: parsed.error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  // Apply edits to the tailored resume
  for (const patchEntry of parsed.data.experience) {
    const expEntry = run.tailoredResume.tailoredExperience.find(
      (e) => e.company === patchEntry.company && e.title === patchEntry.title,
    );
    if (!expEntry) continue;

    for (const patchBullet of patchEntry.bullets) {
      const target = expEntry.bullets[patchBullet.index];
      if (!target) continue;

      if (patchBullet.tailored !== undefined) {
        target.tailored = patchBullet.tailored;
      }
      if (patchBullet.userConfirmed !== undefined) {
        target.userConfirmed = patchBullet.userConfirmed;
      }
    }
  }

  storeServerRun(run);

  return NextResponse.json({ ok: true });
}

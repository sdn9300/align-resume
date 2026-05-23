import { NextResponse } from "next/server";

import { generatePdfsForRun } from "@/lib/pdf";
import { getServerRun } from "@/lib/run-storage";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  // 4.4.2: Check disclaimer verification
  let verified = false;
  try {
    const body = await _request.json();
    verified = body.verified === true;
  } catch {
    // No body or invalid JSON — treat as not verified
  }

  if (!verified) {
    return NextResponse.json(
      {
        error: {
          code: "VERIFICATION_REQUIRED",
          message: "You must verify content accuracy before export.",
          stage: "api/runs/export",
        },
      },
      { status: 400 },
    );
  }

  // 4.4.2: Check guardrail violations
  const run = getServerRun(id);
  if (run?.guardrailWarnings && run.guardrailWarnings.length > 0) {
    const errors = run.guardrailWarnings.filter((w) => w.severity === "error");
    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "GUARDRAIL_VIOLATION",
            message: errors.map((e) => e.message).join("; "),
            stage: "api/runs/export",
            detail: errors,
          },
        },
        { status: 400 },
      );
    }
  }

  const pdfs = await generatePdfsForRun(id);

  if (!pdfs) {
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Run not found. It may have expired or was created in another session.",
          stage: "api/runs/export",
        },
      },
      { status: 404 },
    );
  }

  // Return both PDFs as base64 strings for client-side download
  return NextResponse.json({
    comparison: pdfs.comparison.toString("base64"),
    tailoredResume: pdfs.tailoredResume.toString("base64"),
  });
}

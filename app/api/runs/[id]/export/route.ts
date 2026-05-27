import { NextResponse } from "next/server";

import { generatePdfsForRun } from "@/lib/pdf";
import { getServerRun } from "@/lib/run-storage";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
const logger = (msg: string, ...args: any[]) => console.error(`[PDF-EXPORT] ${msg}`, ...args);

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

  // Try Playwright-based PDF generation, fallback with clear message
  let pdfs = null;
  try {
    pdfs = await generatePdfsForRun(id);
  } catch (e) {
    // Log the actual error for debugging
    logger("PDF generation failed:", e instanceof Error ? e.message : String(e));
  }

  if (!pdfs) {
    return NextResponse.json(
      {
        error: {
          code: "PDF_GENERATION_UNAVAILABLE",
          message:
            "Server-side PDF generation is not available in this environment. Use the print preview buttons below to save as PDF from your browser (Ctrl+P / Cmd+P → Save as PDF).",
          stage: "api/runs/export",
        },
      },
      { status: 501 },
    );
  }

  // Return both PDFs as base64 strings for client-side download
  return NextResponse.json({
    comparison: pdfs.comparison.toString("base64"),
    tailoredResume: pdfs.tailoredResume.toString("base64"),
  });
}

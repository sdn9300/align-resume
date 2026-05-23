import { NextResponse } from "next/server";
import { z } from "zod";

import { runPipeline } from "@/lib/pipeline";
import { storeServerRun } from "@/lib/run-storage";

const createRunBodySchema = z.object({
  resume: z.object({
    type: z.literal("text"),
    content: z.string().min(50, "Resume must be at least 50 characters"),
  }),
  jobDescription: z.object({
    type: z.literal("text"),
    content: z.string().min(80, "Job description must be at least 80 characters"),
  }),
});

export async function POST(request: Request) {
  // Check for GROQ_API_KEY first
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      {
        error: {
          code: "API_KEY_MISSING",
          message:
            "GROQ_API_KEY is not configured. " +
            "Copy .env.example to .env.local and add your key from https://console.groq.com/",
          stage: "api/runs",
        },
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "PARSE_FAILED",
          message: "Invalid JSON body",
          stage: "api/runs",
        },
      },
      { status: 400 },
    );
  }

  const parsed = createRunBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "PARSE_FAILED",
          message: parsed.error.errors[0]?.message ?? "Invalid request",
          stage: "api/runs",
          details: parsed.error.errors.map((e) => e.message),
        },
      },
      { status: 400 },
    );
  }

  try {
    const run = await runPipeline({
      resumeText: parsed.data.resume.content,
      jdText: parsed.data.jobDescription.content,
    });
    storeServerRun(run);
    return NextResponse.json(run);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pipeline execution failed";
    return NextResponse.json(
      {
        error: {
          code: "LLM_FAILED",
          message,
          stage: "api/runs/pipeline",
        },
      },
      { status: 500 },
    );
  }
}

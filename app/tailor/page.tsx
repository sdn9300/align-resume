"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { JDInput } from "@/components/JDInput";
import { ResumeInput } from "@/components/ResumeInput";
import { RunLoadingSkeleton } from "@/components/RunLoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveTailoringRun } from "@/lib/run-storage";
import { tailoringRunSchema } from "@/lib/schemas";

const MIN_RESUME = 50;
const MIN_JD = 80;

/** Simulate pipeline stage transitions for UX feedback */
const STAGES = ["parsing", "analyzing", "tailoring"] as const;
type Stage = (typeof STAGES)[number];

const STAGE_DURATIONS = {
  parsing: 5000,
  analyzing: 8000,
  tailoring: 15000,
} as const;

export default function TailorInputPage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<Stage | null>(null);

  // Auto-load sample data if ?demo=1
  useEffect(() => {
    const isDemo = typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("demo") === "1";
    if (!isDemo) return;
    async function loadSamples() {
      const [resumeResp, jdResp] = await Promise.all([
        fetch("/fixtures/sample-resume.txt"),
        fetch("/fixtures/sample-jd.txt"),
      ]);
      setResumeText(await resumeResp.text());
      setJdText(await jdResp.text());
    }
    void loadSamples();
  }, []);

  const canSubmit =
    resumeText.trim().length >= MIN_RESUME && jdText.trim().length >= MIN_JD && !submitting;

  const handleAnalyze = async () => {
    setError(null);
    setSubmitting(true);
    setCurrentStage("parsing");

    try {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: { type: "text", content: resumeText.trim() },
          jobDescription: { type: "text", content: jdText.trim() },
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error?: { message?: string } }).error?.message === "string"
            ? (data as { error: { message: string } }).error.message
            : "Analysis failed. Please try again.";
        setError(message);
        return;
      }

      const parsed = tailoringRunSchema.safeParse(data);
      if (!parsed.success) {
        setError("Received invalid analysis data. Please try again.");
        return;
      }

      if (parsed.data.status === "failed") {
        setError(
          parsed.data.errors?.join("; ") ?? "Pipeline completed with errors. Try again.",
        );
        return;
      }

      saveTailoringRun(parsed.data);
      router.push(`/tailor/results/${parsed.data.id}`);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
      setCurrentStage(null);
    }
  };

  // Animate stages during submission
  useEffect(() => {
    if (!submitting) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let accumulatedMs = 0;

    for (const stage of STAGES) {
      accumulatedMs += STAGE_DURATIONS[stage];
      timeouts.push(
        setTimeout(() => setCurrentStage(stage), accumulatedMs - STAGE_DURATIONS[stage]),
      );
    }

    return () => timeouts.forEach(clearTimeout);
  }, [submitting]);

  if (submitting) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analyzing…</h1>
          <p className="text-sm text-muted-foreground">
            Running LLM pipeline — resume parsing, JD extraction, match scoring, gap analysis, and bullet tailoring.
          </p>
        </div>
        <RunLoadingSkeleton stage={currentStage ?? undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tailor your resume</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste your resume and a job description. The LLM pipeline will parse, score, and tailor your content.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resume</CardTitle>
            <CardDescription>Plain text for now — file upload coming soon.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResumeInput value={resumeText} onChange={setResumeText} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job description</CardTitle>
            <CardDescription>Use a real listing for the best demo experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <JDInput value={jdText} onChange={setJdText} />
          </CardContent>
        </Card>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void handleAnalyze()} disabled={!canSubmit}>
          Analyze
        </Button>
        {!canSubmit && (
          <p className="text-xs text-muted-foreground">
            Resume ≥ {MIN_RESUME} chars and JD ≥ {MIN_JD} chars required.
          </p>
        )}
      </div>
    </div>
  );
}

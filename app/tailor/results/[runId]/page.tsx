"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { GapAnalysis } from "@/components/GapAnalysis";
import { JDSummary } from "@/components/JDSummary";
import { RunLoadingSkeleton } from "@/components/RunLoadingSkeleton";
import { ScoreCard } from "@/components/ScoreCard";
import { SideBySideDiff } from "@/components/SideBySideDiff";
import { Button } from "@/components/ui/button";
import { useTailoringRun } from "@/hooks/use-tailoring-run";

export default function ResultsPage() {
  const params = useParams<{ runId: string }>();
  const runId = params.runId;
  const { run, loading, error } = useTailoringRun(runId);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Analysis results</h1>
        <RunLoadingSkeleton />
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-900">Run unavailable</h1>
        <p className="text-sm text-red-800">{error ?? "Unknown error"}</p>
        <Button asChild variant="outline">
          <Link href="/tailor">Start new analysis</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analysis results</h1>
          <p className="text-sm text-muted-foreground">
            Original vs tailored match estimates and extracted requirements.
          </p>
        </div>
        <Button asChild>
          <Link href={`/tailor/review/${runId}`}>Review changes</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ScoreCard title="Original match" score={run.originalMatch} variant="original" />
        {run.tailoredMatch ? (
          <ScoreCard title="Tailored match" score={run.tailoredMatch} variant="tailored" />
        ) : null}
      </div>

      <JDSummary jobDescription={run.jobDescription} />

      {run.gaps && run.gaps.length > 0 && <GapAnalysis gaps={run.gaps} />}

      {run.tailoredResume && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Tailored preview</h2>
          <SideBySideDiff tailoredResume={run.tailoredResume} interactive={false} />
        </section>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { RunLoadingSkeleton } from "@/components/RunLoadingSkeleton";
import { SideBySideDiff } from "@/components/SideBySideDiff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTailoringRun } from "@/hooks/use-tailoring-run";

export default function ReviewPage() {
  const params = useParams<{ runId: string }>();
  const runId = params.runId;
  const { run, loading, error } = useTailoringRun(runId);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Review changes</h1>
        <RunLoadingSkeleton />
      </div>
    );
  }

  if (error || !run?.tailoredResume) {
    return (
      <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-900">Nothing to review</h1>
        <p className="text-sm text-red-800">
          {error ?? "Tailored resume data is missing for this run."}
        </p>
        <Button asChild variant="outline">
          <Link href="/tailor">Start new analysis</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Review changes</h1>
          <p className="text-sm text-muted-foreground">
            Accept, edit, or revert each bullet. Changes are saved automatically.
          </p>
        </div>
        <Button asChild>
          <Link href={`/tailor/export/${runId}`}>Continue to export</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tailored summary</CardTitle>
          <CardDescription>Read-only preview in Phase 1.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{run.tailoredResume.tailoredSummary}</p>
        </CardContent>
      </Card>

      <SideBySideDiff tailoredResume={run.tailoredResume} interactive runId={runId} />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { PrintResume } from "@/components/PrintResume";
import { RunLoadingSkeleton } from "@/components/RunLoadingSkeleton";
import { Button } from "@/components/ui/button";
import { useTailoringRun } from "@/hooks/use-tailoring-run";

export default function PrintResumePage() {
  const params = useParams<{ runId: string }>();
  const runId = params.runId;
  const { run, loading, error } = useTailoringRun(runId);

  // Auto-trigger browser print dialog when ?print is present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has("print")) {
        setTimeout(() => window.print(), 500);
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <RunLoadingSkeleton />
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-8">
        <h1 className="text-lg font-semibold">Resume layout unavailable</h1>
        <p className="text-sm text-muted-foreground">{error ?? "Run not found"}</p>
        <Button asChild variant="outline">
          <Link href="/tailor">Start new analysis</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="border-b bg-neutral-100 px-4 py-3 print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <p className="text-sm text-neutral-700">
            Tailored resume print preview — use <kbd className="rounded border px-1">Ctrl+P</kbd> /{" "}
            <kbd className="rounded border px-1">Cmd+P</kbd> to save as PDF.
          </p>
          <Button size="sm" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>
      <PrintResume run={run} />
    </>
  );
}

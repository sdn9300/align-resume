"use client";

import { useState } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import { RunLoadingSkeleton } from "@/components/RunLoadingSkeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTailoringRun } from "@/hooks/use-tailoring-run";
import type { TailoringRun } from "@/lib/schemas";

type UnconfirmedRiskyBullet = {
  company: string;
  title: string;
  index: number;
  riskFlag: string;
};

function findUnconfirmedRiskyBullets(run: TailoringRun): UnconfirmedRiskyBullet[] {
  const result: UnconfirmedRiskyBullet[] = [];
  for (const entry of run.tailoredResume?.tailoredExperience ?? []) {
    for (let i = 0; i < entry.bullets.length; i++) {
      const bullet = entry.bullets[i];
      if (bullet.riskFlag && !bullet.userConfirmed) {
        result.push({
          company: entry.company,
          title: entry.title,
          index: i,
          riskFlag: bullet.riskFlag,
        });
      }
    }
  }
  return result;
}

export default function ExportPage() {
  const params = useParams<{ runId: string }>();
  const runId = params.runId;
  const { run, loading, error } = useTailoringRun(runId);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  const unconfirmedRiskyBullets = run ? findUnconfirmedRiskyBullets(run) : [];

  const exportDisabled = !disclaimerChecked || unconfirmedRiskyBullets.length > 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Export</h1>
        <RunLoadingSkeleton />
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-900">Export unavailable</h1>
        <p className="text-sm text-red-800">{error ?? "Run not found"}</p>
        <Button asChild variant="outline">
          <Link href="/tailor">Start new analysis</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Export</h1>
        <p className="text-sm text-muted-foreground">
          Download PDFs via browser print preview.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Disclaimer</CardTitle>
          <CardDescription>Confirm before downloading.</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-neutral-300"
              checked={disclaimerChecked}
              onChange={(e) => setDisclaimerChecked(e.target.checked)}
            />
            <span className="text-sm text-neutral-700">
              I have verified all tailored content for accuracy. I understand that this tool does
              not guarantee ATS ranking outcomes and is not a substitute for professional career
              advice.
            </span>
          </label>
        </CardContent>
      </Card>

      {unconfirmedRiskyBullets.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-base text-red-900">
              Review required before export
            </CardTitle>
            <CardDescription className="text-red-800">
              The following bullets have risk flags and need your confirmation:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="list-inside list-disc text-sm text-red-800">
              {unconfirmedRiskyBullets.map((b, i) => (
                <li key={i}>
                  <span className="font-medium">{b.company}</span> ({b.title}) — {b.riskFlag}
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <Button asChild variant="outline">
                <Link href={`/tailor/review/${runId}`}>Review and confirm bullets</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Print PDFs</CardTitle>
          <CardDescription>To print the PDFs, click any of the options below.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <Link href={`/export/${runId}`} target="_blank">
              Print Comparison Layout
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/export/${runId}/resume`} target="_blank">
              Print Tailored Resume Layout
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

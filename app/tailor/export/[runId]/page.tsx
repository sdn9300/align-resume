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

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteChars = atob(base64);
  const byteArrays: BlobPart[] = [];
  for (let offset = 0; offset < byteChars.length; offset += 8192) {
    const slice = byteChars.slice(offset, offset + 8192);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: mimeType });
}

function downloadBase64Pdf(base64: string, filename: string) {
  const blob = base64ToBlob(base64, "application/pdf");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

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
  const [downloading, setDownloading] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const unconfirmedRiskyBullets = run ? findUnconfirmedRiskyBullets(run) : [];

  async function fetchExport() {
    const response = await fetch(`/api/runs/${runId}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: true }),
    });
    return response;
  }

  const openPrintPage = (path: string) => {
    setPdfError(null);
    window.open(path, "_blank");
  };

  const handleServerPdf = async (type: "comparison" | "tailoredResume") => {
    setDownloading(true);
    setPdfError(null);
    try {
      const response = await fetchExport();
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const msg = err?.error?.message ?? "Failed to generate PDFs";
        // If PDF generation is unavailable, guide to print preview instead
        if (err?.error?.code === "PDF_GENERATION_UNAVAILABLE") {
          openPrintPage(`/export/${runId}?print=true`);
          return;
        }
        throw new Error(msg);
      }
      const data: { comparison: string; tailoredResume: string } = await response.json();

      if (type === "comparison") {
        downloadBase64Pdf(data.comparison, `comparison-${runId}.pdf`);
      } else {
        downloadBase64Pdf(data.tailoredResume, `tailored-resume-${runId}.pdf`);
      }
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : "PDF generation failed. Use the print preview buttons below.");
    } finally {
      setDownloading(false);
    }
  };

  const handleServerPdfBoth = async () => {
    setDownloading(true);
    setPdfError(null);
    try {
      const response = await fetchExport();
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const msg = err?.error?.message ?? "Failed to generate PDFs";
        if (err?.error?.code === "PDF_GENERATION_UNAVAILABLE") {
          openPrintPage(`/export/${runId}?print=true`);
          return;
        }
        throw new Error(msg);
      }
      const data: { comparison: string; tailoredResume: string } = await response.json();
      downloadBase64Pdf(data.comparison, `comparison-${runId}.pdf`);
      downloadBase64Pdf(data.tailoredResume, `tailored-resume-${runId}.pdf`);
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : "PDF generation failed. Use the print preview buttons below.");
    } finally {
      setDownloading(false);
    }
  };

  const exportDisabled = !disclaimerChecked || downloading || unconfirmedRiskyBullets.length > 0;

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
          Download server-generated PDFs or use browser print preview.
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
          <CardTitle className="text-base">Download PDFs</CardTitle>
          <CardDescription>Tries server-side generation (Playwright) — falls back to browser print preview.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={() => void handleServerPdfBoth()}
            disabled={exportDisabled}
          >
            {downloading ? "Generating…" : "Download both PDFs"}
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleServerPdf("comparison")}
            disabled={exportDisabled}
          >
            Comparison only
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleServerPdf("tailoredResume")}
            disabled={exportDisabled}
          >
            Tailored resume only
          </Button>
        </CardContent>
      </Card>

      {pdfError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
          {pdfError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Print preview</CardTitle>
          <CardDescription>Open the print layout in a new tab — use Ctrl+P / Cmd+P → Save as PDF.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <Link href={`/export/${runId}`} target="_blank">
              Open comparison layout
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/export/${runId}/resume`} target="_blank">
              Open tailored resume layout
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

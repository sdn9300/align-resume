"use client";

import { BulletReviewRow } from "@/components/BulletReviewRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TailoredResume } from "@/lib/schemas";

type SideBySideDiffProps = {
  tailoredResume: TailoredResume;
  interactive?: boolean;
  runId?: string;
};

export function SideBySideDiff({ tailoredResume, interactive = true, runId }: SideBySideDiffProps) {
  const entries = tailoredResume.tailoredExperience;

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Side-by-side comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No experience bullets to compare.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <Card key={`${entry.company}-${entry.title}`}>
          <CardHeader>
            <CardTitle className="text-base">
              {entry.title} · {entry.company}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {entry.bullets.map((bullet, index) =>
              interactive ? (
                <BulletReviewRow
                  key={`${entry.company}-${index}-${bullet.original.slice(0, 24)}`}
                  bullet={bullet}
                  runId={runId ?? ""}
                  company={entry.company}
                  title={entry.title}
                  bulletIndex={index}
                />
              ) : (
                <div
                  key={`${entry.company}-${index}-${bullet.original.slice(0, 24)}`}
                  className="grid gap-3 rounded-md border p-4 md:grid-cols-2 print:break-inside-avoid"
                >
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Original</p>
                    <p className="text-sm">{bullet.original}</p>
                  </div>
                  <div
                    className={
                      bullet.original.trim() !== bullet.tailored.trim()
                        ? "rounded bg-amber-50 p-2"
                        : ""
                    }
                  >
                    <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Tailored</p>
                    <p className="text-sm">{bullet.tailored}</p>
                  </div>
                </div>
              ),
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

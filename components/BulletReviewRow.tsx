"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Confidence, TailoredBullet } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type BulletReviewRowProps = {
  bullet: TailoredBullet;
  runId: string;
  company: string;
  title: string;
  bulletIndex: number;
};

function confidenceClasses(confidence: Confidence): string {
  if (confidence === "low") return "bg-amber-50 border-amber-200";
  if (confidence === "high") return "bg-emerald-50 border-emerald-200";
  return "bg-slate-50 border-slate-200";
}

export function BulletReviewRow({ bullet, runId, company, title, bulletIndex }: BulletReviewRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [edited, setEdited] = useState(bullet.tailored);
  const [accepted, setAccepted] = useState(bullet.userConfirmed ?? false);
  const [pending, setPending] = useState(false);

  const changed = bullet.original.trim() !== bullet.tailored.trim();

  async function patchBullet(updates: { tailored?: string; userConfirmed?: boolean }) {
    setPending(true);
    try {
      await fetch(`/api/runs/${runId}/bullets`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experience: [
            {
              company,
              title,
              bullets: [{ index: bulletIndex, ...updates }],
            },
          ],
        }),
      });
    } catch {
      // API error — local state still reflects intent
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-md border p-4",
        bullet.riskFlag && "border-red-300 bg-red-50/40",
        !bullet.riskFlag && confidenceClasses(bullet.confidence),
      )}
    >
      <div className="mb-3 grid gap-3 md:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Original
          </p>
          <p className="text-sm">{bullet.original}</p>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tailored
          </p>
          <textarea
            className="w-full rounded border border-input bg-background p-2 text-sm"
            value={edited}
            onChange={(e) => setEdited(e.target.value)}
            onBlur={() => {
              if (edited !== bullet.tailored) {
                void patchBullet({ tailored: edited });
              }
            }}
            rows={3}
            aria-label="Edit tailored bullet"
            disabled={pending}
          />
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline">{bullet.confidence} confidence</Badge>
        {changed ? <Badge variant="secondary">Changed</Badge> : <Badge variant="outline">Unchanged</Badge>}
        {accepted && <Badge variant="default">Accepted</Badge>}
        {bullet.riskFlag && !accepted && <Badge variant="high">Risk: review required</Badge>}
        {pending && <span className="text-xs text-muted-foreground">Saving…</span>}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={accepted ? "secondary" : "default"}
          disabled={pending}
          onClick={() => {
            setAccepted(true);
            void patchBullet({ userConfirmed: true });
          }}
        >
          Accept
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => {
            setEdited(bullet.original);
            setAccepted(false);
            void patchBullet({ tailored: bullet.original, userConfirmed: false });
          }}
        >
          Revert
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Hide details" : "Show details"}
        </Button>
      </div>

      {expanded && (
        <dl className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Reason</dt>
            <dd>{bullet.changeReason}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Keywords addressed</dt>
            <dd className="mt-1 flex flex-wrap gap-1">
              {bullet.keywordsAddressed.length > 0 ? (
                bullet.keywordsAddressed.map((kw) => (
                  <Badge key={kw} variant="secondary">
                    {kw}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </dd>
          </div>
          {bullet.riskFlag && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Risk flag</dt>
              <dd className="text-red-700">{bullet.riskFlag}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}

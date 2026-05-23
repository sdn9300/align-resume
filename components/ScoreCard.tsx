import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchScore } from "@/lib/schemas";

type ScoreCardProps = {
  title: string;
  score: MatchScore;
  variant?: "original" | "tailored";
};

function safeScore(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function ScoreCard({ title, score, variant = "original" }: ScoreCardProps) {
  const overall = safeScore(score.overallScore);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span>{title}</span>
          <span
            className={
              variant === "tailored"
                ? "text-emerald-700"
                : "text-neutral-700"
            }
          >
            {overall}/100
          </span>
        </CardTitle>
        <CardDescription>
          Match estimate — heuristic score, not an ATS guarantee.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{score.explanation}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Skills</dt>
            <dd className="font-medium">{safeScore(score.skillCoverageScore)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Responsibilities</dt>
            <dd className="font-medium">{safeScore(score.responsibilityAlignmentScore)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Keywords</dt>
            <dd className="font-medium">{safeScore(score.keywordScore)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Seniority</dt>
            <dd className="font-medium">{safeScore(score.seniorityScore)}</dd>
          </div>
        </dl>
        {score.criticalMissingRequirements.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Critical gaps
            </p>
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              {score.criticalMissingRequirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

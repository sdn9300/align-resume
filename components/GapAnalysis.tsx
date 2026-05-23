import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResumeGap } from "@/lib/schemas";

type GapAnalysisProps = {
  gaps: ResumeGap[];
};

function importanceVariant(importance: ResumeGap["importance"]) {
  if (importance === "high") return "high" as const;
  if (importance === "medium") return "medium" as const;
  return "low" as const;
}

const actionLabels: Record<string, string> = {
  add_if_true: "Add if you have this experience",
  leave_out: "Leave out if not true",
  mention_in_skills: "Mention in skills if familiar",
  add_project_bullet: "Add a project bullet if applicable",
  interview_prep: "Prepare to address in interview",
};

export function GapAnalysis({ gaps }: GapAnalysisProps) {
  if (gaps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gap analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No gaps identified for this run.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Gap analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gaps.map((gap) => (
          <div key={gap.name} className="rounded-md border border-border p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <p className="font-medium">{gap.name}</p>
              <Badge variant={importanceVariant(gap.importance)}>
                {gap.importance}
              </Badge>
              {!gap.canSafelyAdd && (
                <Badge variant="outline">Do not auto-add</Badge>
              )}
            </div>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">JD evidence</dt>
                <dd className="mt-0.5">{gap.jdEvidence}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Resume evidence</dt>
                <dd className="mt-0.5 text-muted-foreground">
                  {gap.resumeEvidence || "Not mentioned"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Suggested action</dt>
                <dd className="mt-0.5">
                  {actionLabels[gap.suggestedAction] ?? gap.suggestedAction}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

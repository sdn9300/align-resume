import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { JobDescriptionProfile } from "@/lib/schemas";

type JDSummaryProps = {
  jobDescription: JobDescriptionProfile;
};

function ChipList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant="secondary">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function JDSummary({ jobDescription }: JDSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {jobDescription.jobTitle}
          {jobDescription.company ? (
            <span className="font-normal text-muted-foreground">
              {" "}
              · {jobDescription.company}
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Seniority: {jobDescription.seniorityLevel}</Badge>
          {jobDescription.domainSignals.map((signal) => (
            <Badge key={signal} variant="outline">
              {signal}
            </Badge>
          ))}
        </div>
        <ChipList label="Required skills" items={jobDescription.requiredSkills} />
        <ChipList label="Preferred skills" items={jobDescription.preferredSkills} />
        <ChipList label="Tools" items={jobDescription.tools} />
        <ChipList label="Keywords" items={jobDescription.keywords} />
        {jobDescription.responsibilities.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Top responsibilities
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {jobDescription.responsibilities.slice(0, 4).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

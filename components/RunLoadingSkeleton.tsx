import { Skeleton } from "@/components/ui/skeleton";

type RunLoadingSkeletonProps = {
  stage?: string;
};

// Cycle through stage messages to show pipeline progress
const STAGE_MESSAGES: Record<string, string> = {
  parsing: "Parsing resume and job description…",
  analyzing: "Analyzing match and identifying gaps…",
  tailoring: "Tailoring bullet points to job requirements…",
  default: "Processing through LLM pipeline (this may take 30–60s)…",
};

export function RunLoadingSkeleton({ stage }: RunLoadingSkeletonProps) {
  const message = stage ? STAGE_MESSAGES[stage] ?? STAGE_MESSAGES.default : STAGE_MESSAGES.default;

  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading analysis">
      <p className="text-sm italic text-muted-foreground">{message}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

/** Simple loading state for the initial submit button */
export function SubmitLoadingSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Submitting analysis">
      <p className="text-sm italic text-muted-foreground">
        Submitting resume and job description for LLM analysis…
      </p>
    </div>
  );
}

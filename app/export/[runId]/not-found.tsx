import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg space-y-4 p-8">
      <h1 className="text-lg font-semibold">Run not found</h1>
      <p className="text-sm text-muted-foreground">
        This report may have expired or was created in another session. Start a new analysis to
        generate a fresh report.
      </p>
      <Button asChild variant="outline">
        <Link href="/tailor">Start new analysis</Link>
      </Button>
    </div>
  );
}

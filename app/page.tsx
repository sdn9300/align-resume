import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">AlignResume</p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Truthful resume tailoring for every job description
        </h1>
        <p className="text-lg text-muted-foreground">
          Paste your resume and a real job listing to see match scores, gap analysis, bullet-level
          rewrites, and a side-by-side comparison — without inventing experience.
        </p>
      </div>

      <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
        <li className="rounded-lg border border-border/80 bg-white p-4">Explainable match scores (before & after)</li>
        <li className="rounded-lg border border-border/80 bg-white p-4">Gap analysis with honest suggested actions</li>
        <li className="rounded-lg border border-border/80 bg-white p-4">Side-by-side bullet review with metadata</li>
        <li className="rounded-lg border border-border/80 bg-white p-4">Print-ready comparison layout + PDF downloads</li>
      </ul>

      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/tailor">Start tailoring</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/tailor?demo=1">Try with sample data</Link>
        </Button>
      </div>
    </main>
  );
}

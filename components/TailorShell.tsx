"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { StepIndicator } from "@/components/StepIndicator";

export function TailorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const runIdMatch = pathname.match(/\/tailor\/(?:results|review|export)\/([^/]+)/);
  const runId = runIdMatch?.[1];

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-lg font-semibold tracking-tight text-primary">
              AlignResume
            </Link>
            <Link
              href="/tailor"
              className="rounded-full border border-border/60 px-4 py-1.5 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
            >
              New analysis
            </Link>
          </div>
          <StepIndicator runId={runId} />
        </div>
      </header>
      <div id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}

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
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="font-semibold tracking-tight">
              AlignResume
            </Link>
            <Link href="/tailor" className="text-sm text-muted-foreground hover:text-foreground">
              New analysis
            </Link>
          </div>
          <StepIndicator runId={runId} />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}

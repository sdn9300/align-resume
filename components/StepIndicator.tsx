"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const STEPS = [
  { id: "input", label: "Input", href: () => "/tailor" },
  {
    id: "results",
    label: "Analyze",
    href: (runId?: string) => (runId ? `/tailor/results/${runId}` : "#"),
  },
  {
    id: "review",
    label: "Review",
    href: (runId?: string) => (runId ? `/tailor/review/${runId}` : "#"),
  },
  {
    id: "export",
    label: "Export",
    href: (runId?: string) => (runId ? `/tailor/export/${runId}` : "#"),
  },
] as const;

type StepIndicatorProps = {
  runId?: string;
};

export function StepIndicator({ runId }: StepIndicatorProps) {
  const pathname = usePathname();

  const activeIndex = STEPS.findIndex((step) => {
    if (step.id === "input") return pathname === "/tailor";
    if (step.id === "results") return pathname.includes("/results/");
    if (step.id === "review") return pathname.includes("/review/");
    if (step.id === "export") return pathname.includes("/export/");
    return false;
  });

  return (
    <nav aria-label="Progress" className="flex flex-wrap items-center gap-2 text-sm">
      {STEPS.map((step, index) => {
        const href = step.href(runId);
        const disabled = !runId && step.id !== "input";
        const isActive = index === activeIndex;
        const isComplete = activeIndex > index;

        const content = (
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
              isActive && "bg-foreground text-background shadow-sm",
              !isActive && isComplete && "bg-primary/10 text-primary",
              !isActive && !isComplete && "text-muted-foreground",
              disabled && "opacity-40",
            )}
          >
            <span className="font-medium">{index + 1}.</span>
            {step.label}
          </span>
        );

        if (disabled || href === "#") {
          return (
            <span key={step.id} aria-disabled="true">
              {content}
            </span>
          );
        }

        return (
          <Link key={step.id} href={href} aria-current={isActive ? "step" : undefined}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}

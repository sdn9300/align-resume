import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline" | "high" | "medium" | "low";
};

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-neutral-900 text-white",
  secondary: "bg-muted text-foreground",
  outline: "border border-input bg-background text-foreground",
  high: "bg-red-100 text-red-800 border border-red-200",
  medium: "bg-amber-100 text-amber-900 border border-amber-200",
  low: "bg-slate-100 text-slate-700 border border-slate-200",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

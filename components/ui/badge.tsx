import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline" | "high" | "medium" | "low";
};

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-foreground text-background",
  secondary: "bg-primary/10 text-primary border border-primary/20",
  outline: "border border-border/70 bg-background text-foreground",
  high: "bg-red-50 text-red-700 border border-red-200",
  medium: "bg-amber-50 text-amber-800 border border-amber-200",
  low: "bg-slate-50 text-slate-600 border border-slate-200",
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

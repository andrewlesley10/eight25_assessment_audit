import * as React from "react";
import { cn } from "@/lib/utils/cn";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "good" | "warning" | "poor" | "accent";
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        tone === "neutral" && "border-white/10 bg-white/5 text-slate-200",
        tone === "good" && "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
        tone === "warning" && "border-amber-400/20 bg-amber-400/10 text-amber-200",
        tone === "poor" && "border-rose-400/20 bg-rose-400/10 text-rose-200",
        tone === "accent" && "border-cobalt/30 bg-cobalt/10 text-blue-100",
        className
      )}
      {...props}
    />
  );
}

import * as React from "react";
import { cn } from "@/lib/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt/50 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-cobalt text-white shadow-panel hover:-translate-y-0.5 hover:bg-[#426cf6]",
        variant === "secondary" &&
          "border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10",
        variant === "ghost" && "text-slate-300 hover:bg-white/5",
        className
      )}
      {...props}
    />
  );
}

import * as React from "react";
import { cn } from "../../lib/utils";

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
};

export function Badge({ className, tone = "neutral", ...props }: Props) {
  const tones: Record<NonNullable<Props["tone"]>, string> = {
    neutral: "bg-slate-100 text-slate-700 ring-slate-200",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    warning: "bg-amber-50 text-amber-700 ring-amber-200",
    danger: "bg-rose-50 text-rose-700 ring-rose-200",
    info: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}


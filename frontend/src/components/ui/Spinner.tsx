import * as React from "react";
import { cn } from "../../lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg";
};

export function Spinner({ className, size = "md", ...props }: Props) {
  const sizes: Record<NonNullable<Props["size"]>, string> = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-[3px]",
  };

  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-slate-300 border-t-indigo-600",
        sizes[size],
        className
      )}
      aria-label="Loading"
      role="status"
      {...props}
    />
  );
}


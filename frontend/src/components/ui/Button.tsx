import * as React from "react";
import { cn } from "../../lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  children,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary:
      "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700",
    secondary:
      "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 active:bg-slate-100",
    ghost: "bg-transparent text-slate-800 hover:bg-slate-100 active:bg-slate-200",
    danger:
      "bg-rose-600 text-white shadow-sm hover:bg-rose-500 active:bg-rose-700",
  };

  const sizes: Record<NonNullable<Props["size"]>, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-5 text-base",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
}


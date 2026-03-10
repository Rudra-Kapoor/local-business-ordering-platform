import * as React from "react";
import { cn } from "../../lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ className, label, hint, error, ...props }: Props) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-1 text-sm font-medium text-slate-800">{label}</div>
      ) : null}
      <input
        className={cn(
          "h-11 w-full rounded-xl bg-white px-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500",
          error ? "ring-rose-300 focus:ring-rose-500" : "",
          className
        )}
        {...props}
      />
      {error ? (
        <div className="mt-1 text-sm text-rose-600">{error}</div>
      ) : hint ? (
        <div className="mt-1 text-sm text-slate-500">{hint}</div>
      ) : null}
    </label>
  );
}


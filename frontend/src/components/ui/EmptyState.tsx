import { Button } from "./Button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
      <div className="mx-auto max-w-sm">
        <div className="text-base font-semibold text-slate-900">{title}</div>
        {description ? (
          <div className="mt-1 text-sm text-slate-600">{description}</div>
        ) : null}
        {actionLabel && onAction ? (
          <div className="mt-5">
            <Button variant="secondary" onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}


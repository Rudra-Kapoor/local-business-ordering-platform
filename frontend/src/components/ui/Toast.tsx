import * as React from "react";
import { cn } from "../../lib/utils";

type ToastItem = {
  id: string;
  message: string;
  tone?: "info" | "success" | "danger";
};

type ToastContextValue = {
  push: (message: string, tone?: ToastItem["tone"]) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const push = React.useCallback((message: string, tone?: ToastItem["tone"]) => {
    const id = crypto.randomUUID();
    const item: ToastItem = { id, message, tone: tone ?? "info" };
    setItems((prev) => [item, ...prev].slice(0, 3));
    window.setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "rounded-2xl bg-white p-4 text-sm shadow-lg ring-1",
              t.tone === "success"
                ? "ring-emerald-200"
                : t.tone === "danger"
                  ? "ring-rose-200"
                  : "ring-slate-200"
            )}
          >
            <div className="font-medium text-slate-900">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}


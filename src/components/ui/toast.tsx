"use client";

import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type ToastVariant = "info" | "success" | "warning" | "error";

export type ToastInput = {
  title: string;
  description?: ReactNode;
  variant?: ToastVariant;
  duration?: number;
};

type ToastItem = Required<Pick<ToastInput, "title" | "variant" | "duration">> &
  Pick<ToastInput, "description"> & {
    id: string;
  };

type ToastContextValue = {
  toasts: ToastItem[];
  addToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
};

type ToastListener = (toast: ToastInput) => void;

const ToastContext = createContext<ToastContextValue | null>(null);
const listeners = new Set<ToastListener>();

const variantConfig: Record<
  ToastVariant,
  { className: string; icon: typeof Info }
> = {
  info: {
    className: "border-lavender/40 bg-white text-ink",
    icon: Info,
  },
  success: {
    className: "border-teal/40 bg-white text-ink",
    icon: CheckCircle2,
  },
  warning: {
    className: "border-orange/55 bg-white text-ink",
    icon: TriangleAlert,
  },
  error: {
    className: "border-red-500/45 bg-white text-ink",
    icon: AlertCircle,
  },
};

export const toast = {
  show(input: ToastInput) {
    listeners.forEach((listener) => listener(input));
  },
  info(title: string, description?: ReactNode) {
    toast.show({ title, description, variant: "info" });
  },
  success(title: string, description?: ReactNode) {
    toast.show({ title, description, variant: "success" });
  },
  warning(title: string, description?: ReactNode) {
    toast.show({ title, description, variant: "warning" });
  },
  error(title: string, description?: ReactNode) {
    toast.show({ title, description, variant: "error" });
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const addToast = useCallback((input: ToastInput) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    const item: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      variant: input.variant ?? "info",
      duration: input.duration ?? 5000,
    };

    setToasts((current) => [...current.slice(-4), item]);
    return id;
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => {
      listeners.delete(addToast);
    };
  }, [addToast]);

  const value = useMemo(
    () => ({ toasts, addToast, dismissToast }),
    [addToast, dismissToast, toasts],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used within ToastProvider");
  return value;
}

export function Toaster() {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      className="fixed right-4 top-4 z-50 grid w-[calc(100vw-2rem)] max-w-sm gap-3 sm:right-6 sm:top-6"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} toast={item} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

function ToastCard({
  toast: item,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const config = variantConfig[item.variant];
  const Icon = config.icon;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onDismiss(item.id);
    }, item.duration);

    return () => window.clearTimeout(timeoutId);
  }, [item.duration, item.id, onDismiss]);

  return (
    <div
      role={item.variant === "error" ? "alert" : "status"}
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 rounded-lg border p-4 shadow-[0_18px_60px_-28px_rgba(23,23,23,0.65)]",
        config.className,
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{item.title}</p>
        {item.description ? (
          <div className="mt-1 text-xs leading-5 text-muted">
            {item.description}
          </div>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
        aria-label="Dismiss notification"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

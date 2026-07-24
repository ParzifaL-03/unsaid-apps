import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: ReactNode;
  error?: string;
};

export function Input({ label, hint, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label htmlFor={inputId} className="grid gap-2">
      {label ? <span className="text-sm font-semibold">{label}</span> : null}
      <input
        id={inputId}
        className={cn(
          "min-h-[52px] w-full rounded-2xl border border-border bg-surface px-4 text-base text-ink placeholder:text-muted outline-none transition focus:border-ink focus:ring-4 focus:ring-lavender/20",
          error && "border-red-600 focus:border-red-600 focus:ring-red-100",
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? (
        <span className="text-xs font-medium text-red-700">{error}</span>
      ) : hint ? (
        <span className="text-xs leading-5 text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

import type { ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: ReactNode;
  error?: string;
};

export function Textarea({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <label htmlFor={textareaId} className="grid gap-2">
      {label ? <span className="text-sm font-semibold">{label}</span> : null}
      <textarea
        id={textareaId}
        className={cn(
          "min-h-40 w-full resize-y rounded-[22px] border border-border bg-surface p-4 text-base leading-6 text-ink placeholder:text-muted outline-none transition focus:border-ink focus:ring-4 focus:ring-lavender/20",
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

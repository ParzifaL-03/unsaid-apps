import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "warning" | "danger";

const variants: Record<AlertVariant, { className: string; icon: typeof Info }> =
  {
    info: { className: "bg-lavender text-white", icon: Info },
    success: { className: "bg-teal text-white", icon: CheckCircle2 },
    warning: { className: "bg-orange text-ink", icon: TriangleAlert },
    danger: { className: "bg-red-600 text-white", icon: AlertCircle },
  };

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: ReactNode;
  variant?: AlertVariant;
};

export function Alert({
  title,
  description,
  variant = "info",
  className,
  ...props
}: AlertProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      role="status"
      className={cn(
        "flex gap-3 rounded-[18px] p-4 shadow-[0_12px_32px_-22px_rgba(23,23,23,0.45)]",
        config.className,
        className,
      )}
      {...props}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description ? (
          <div className="mt-1 text-xs leading-5 opacity-90">{description}</div>
        ) : null}
      </div>
    </div>
  );
}

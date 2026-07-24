import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const chipVariants = cva(
  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-3.5 text-xs font-medium tracking-[0.01em] transition-transform active:scale-95",
  {
    variants: {
      variant: {
        topic: "bg-orange text-ink",
        mood: "bg-coral text-ink",
        capsule: "bg-lavender text-white",
        selected: "bg-teal text-white",
        neutral: "border border-border bg-surface text-ink",
      },
    },
    defaultVariants: {
      variant: "topic",
    },
  },
);

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof chipVariants>;

export function Chip({
  className,
  variant,
  type = "button",
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      className={cn(chipVariants({ variant }), className)}
      {...props}
    />
  );
}

import type { HTMLAttributes } from "react";
import { cn, initials } from "@/lib/utils";

const colors = ["bg-coral", "bg-orange", "bg-teal text-white", "bg-lavender text-white"];

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  alias: string;
  size?: "sm" | "md" | "lg";
};

export function Avatar({ alias, size = "md", className, ...props }: AvatarProps) {
  const color = colors[alias.length % colors.length];
  const sizeClass = {
    sm: "size-9 text-[10px]",
    md: "size-10 text-xs",
    lg: "size-[72px] text-base",
  }[size];

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-bold uppercase",
        color,
        sizeClass,
        className,
      )}
      aria-label={`Anonymous alias ${alias}`}
      {...props}
    >
      {initials(alias)}
    </div>
  );
}

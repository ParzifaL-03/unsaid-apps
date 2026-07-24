"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileNavigation } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 rounded-t-[22px] bg-inverse px-2 text-white shadow-[0_-12px_40px_-24px_rgba(23,23,23,0.8)] md:hidden"
    >
      {mobileNavigation.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "grid min-w-0 place-items-center gap-0.5 py-2 text-[10px] font-medium",
              active ? "text-coral" : "text-white/80",
            )}
          >
            <Icon className="size-[18px]" strokeWidth={active ? 2.5 : 2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

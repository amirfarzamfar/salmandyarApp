"use client";

import type React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildInternalPath, canUseTrackedBack } from "./navigation-history";

export function SmartBackLink({
  href,
  label = "بازگشت",
  ariaLabel,
  className,
  iconClassName,
}: {
  href: string;
  label?: string;
  ariaLabel?: string;
  className?: string;
  iconClassName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === "undefined") return;

    const current = buildInternalPath(pathname, window.location.search.replace(/^\?/, ""));
    if (!canUseTrackedBack(current)) {
      return;
    }

    e.preventDefault();
    router.back();
    window.setTimeout(() => {
      const nextPath = buildInternalPath(window.location.pathname, window.location.search.replace(/^\?/, ""));
      if (nextPath === current) {
        router.push(href);
      }
    }, 180);
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={ariaLabel || label || "بازگشت به صفحه قبل"}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-2xl border border-gray-200/80 bg-white/90 px-3.5 py-2 text-sm font-bold text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white hover:text-gray-900 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-900 dark:hover:text-white dark:focus-visible:ring-offset-gray-950",
        className
      )}
    >
      <ChevronRight className={cn("h-4 w-4 shrink-0", iconClassName)} aria-hidden="true" />
      {label ? <span className="truncate">{label}</span> : <span className="sr-only">بازگشت</span>}
    </Link>
  );
}

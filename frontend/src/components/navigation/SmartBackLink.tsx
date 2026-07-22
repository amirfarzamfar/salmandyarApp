"use client";

import type React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SmartBackLink({
  href,
  label = "بازگشت",
  className,
  iconClassName,
}: {
  href: string;
  label?: string;
  className?: string;
  iconClassName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === "undefined") return;

    const canGoBack = window.history.length > 1 && document.referrer.startsWith(window.location.origin);
    if (!canGoBack) return;

    e.preventDefault();
    const current = pathname;
    router.back();
    window.setTimeout(() => {
      if (window.location.pathname === current) router.push(href);
    }, 150);
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors",
        className
      )}
    >
      <ChevronRight className={cn("h-4 w-4", iconClassName)} />
      {label ? <span>{label}</span> : null}
    </Link>
  );
}

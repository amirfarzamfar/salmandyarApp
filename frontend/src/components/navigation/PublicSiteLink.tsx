"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublicSiteLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      target="_blank"
      rel="noreferrer"
      title="مشاهده سایت"
      aria-label="مشاهده سایت در تب جدید"
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-3 text-sm font-bold text-gray-600 shadow-sm backdrop-blur transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
        className
      )}
    >
      <Home className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">مشاهده سایت</span>
    </Link>
  );
}


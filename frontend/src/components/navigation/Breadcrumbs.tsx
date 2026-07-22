"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { BreadcrumbItem } from "./panel-navigation";

export function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  if (!items.length) return null;

  return (
    <nav className={cn("text-xs font-bold text-gray-500 dark:text-gray-400", className)} aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const content = item.href && !isLast ? (
            <Link href={item.href} className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={cn(isLast ? "text-gray-800 dark:text-gray-100" : "")}>{item.label}</span>
          );

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-x-1">
              {content}
              {!isLast && <span className="text-gray-300 dark:text-gray-700">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}


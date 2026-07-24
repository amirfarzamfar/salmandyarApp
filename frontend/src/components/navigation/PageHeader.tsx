"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SmartBackLink } from "./SmartBackLink";
import { Breadcrumbs } from "./Breadcrumbs";
import type { BreadcrumbItem } from "./panel-navigation";

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "بازگشت",
  breadcrumbs = [],
  actions,
  badge,
  className,
  contentClassName,
  theme = "default",
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
  contentClassName?: string;
  theme?: "default" | "inverse";
}) {
  const inverse = theme === "inverse";

  return (
    <div className={cn("mb-6 flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start gap-3">
            {backHref ? (
              <SmartBackLink
                href={backHref}
                label={backLabel}
                className={cn(
                  "shrink-0",
                  inverse &&
                    "border-slate-700 bg-slate-800/90 text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white focus-visible:ring-offset-slate-950 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200",
                )}
              />
            ) : null}

            <div className={cn("min-w-0 flex-1", contentClassName)}>
              {badge ? <div className="mb-2">{badge}</div> : null}
              <h1
                className={cn(
                  "truncate text-xl font-black tracking-tight sm:text-2xl",
                  inverse ? "text-white" : "text-gray-900 dark:text-gray-100",
                )}
              >
                {title}
              </h1>
              {description ? (
                <p
                  className={cn(
                    "mt-1 max-w-3xl text-sm leading-7 sm:text-[15px]",
                    inverse ? "text-slate-300" : "text-gray-500 dark:text-gray-400",
                  )}
                >
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          {breadcrumbs.length > 0 ? (
            <Breadcrumbs
              items={breadcrumbs}
              className={cn("mt-3", inverse && "text-slate-400")}
            />
          ) : null}
        </div>

        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div> : null}
      </div>
    </div>
  );
}

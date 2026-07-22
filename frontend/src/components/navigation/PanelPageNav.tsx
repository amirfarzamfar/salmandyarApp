"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./Breadcrumbs";
import { SmartBackLink } from "./SmartBackLink";
import { getPanelNavigation, type PanelKey } from "./panel-navigation";

export function PanelPageNav({
  panel,
  className,
  dense,
}: {
  panel: PanelKey;
  className?: string;
  dense?: boolean;
}) {
  const pathname = usePathname();
  const nav = getPanelNavigation(panel, pathname);

  if (!nav.show) return null;

  return (
    <div className={cn(dense ? "mb-3" : "mb-6", className)}>
      <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", dense ? "" : "")}>
        <div className="flex items-center justify-between gap-3">
          <div className="text-lg font-black text-gray-900 dark:text-gray-100">{nav.title}</div>
          {nav.backHref && <SmartBackLink href={nav.backHref} className="sm:hidden" />}
        </div>

        {nav.backHref && <SmartBackLink href={nav.backHref} className="hidden sm:inline-flex" />}
      </div>

      <Breadcrumbs items={nav.breadcrumbs} className={dense ? "mt-1" : "mt-2"} />
    </div>
  );
}


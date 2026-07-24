"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageHeader } from "./PageHeader";
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
    <PageHeader
      title={nav.title}
      description={nav.description}
      backHref={nav.backHref}
      breadcrumbs={nav.breadcrumbs}
      className={cn(dense ? "mb-4" : "mb-6", className)}
    />
  );
}

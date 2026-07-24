"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { buildInternalPath, writeNavigationTrail } from "./navigation-history";

export function NavigationHistoryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    writeNavigationTrail(buildInternalPath(pathname, typeof window !== "undefined" ? window.location.search.replace(/^\?/, "") : ""));
  }, [pathname]);

  return null;
}

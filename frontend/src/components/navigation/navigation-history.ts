"use client";

export type NavigationTrail = {
  previous?: string;
  current?: string;
};

const STORAGE_KEY = "salmandyar-navigation-trail";

export function buildInternalPath(pathname: string, search?: string) {
  return search ? `${pathname}?${search}` : pathname;
}

export function readNavigationTrail(): NavigationTrail {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as NavigationTrail;
  } catch {
    return {};
  }
}

export function writeNavigationTrail(path: string) {
  if (typeof window === "undefined" || !path) {
    return;
  }

  const trail = readNavigationTrail();
  if (trail.current === path) {
    return;
  }

  window.sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      previous: trail.current,
      current: path,
    } satisfies NavigationTrail),
  );
}

export function getPreviousInternalPath() {
  return readNavigationTrail().previous;
}

export function canUseTrackedBack(currentPath: string) {
  const previous = getPreviousInternalPath();
  if (!previous || previous === currentPath) {
    return false;
  }

  if (typeof window === "undefined") {
    return false;
  }

  const historyState = window.history.state as { idx?: number } | null;
  return typeof historyState?.idx === "number" ? historyState.idx > 0 : window.history.length > 1;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const n = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n : fallback;
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function formatPersianNumber(n: number | string): string {
  const s = String(n);
  const map: Record<string, string> = {
    '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
    '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
  };
  return s.replace(/\d/g, (d) => map[d] ?? d);
}

export function formatJalaliDateTime(isoOrDate?: string | null): string {
  if (!isoOrDate) return '—';
  try {
    const d = new Date(isoOrDate);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return '—';
  }
}

export function debounce<T extends (...args: any[]) => unknown>(
  fn: T,
  delayMs = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

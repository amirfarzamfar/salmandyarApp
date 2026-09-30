'use client';

import { ReactNode } from 'react';
import { AlertTriangle, FlaskConical } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { PortalButton } from '@/components/portal/ui/portal-button';
import { safeFormatJalali, safeParseDate } from '@/lib/assignment-status';

export const labInput = 'w-full min-w-0 min-h-12 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100';
export const labCard = 'min-w-0 rounded-[32px] bg-white p-5 text-slate-900 shadow-sm ring-1 ring-slate-200 sm:p-6';
export const labDate = (value: string) => safeFormatJalali(safeParseDate(value), 'd MMMM yyyy', 'تاریخ نامعتبر');
export const labRange = (min?: number | null, max?: number | null) =>
  min == null && max == null ? 'محدوده تعریف نشده' : `${min ?? '...'} تا ${max ?? '...'}`;

function toLocalYmd(d: Date): [number, number, number] | null {
  try {
    if (!d || isNaN(d.getTime())) return null;
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
  } catch {
    return null;
  }
}

function parseNominalYmd(iso: string): [number, number, number] | null {
  try {
    if (!iso) return null;
    const trimmed = iso.trim();
    if (!trimmed) return null;
    let dt: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map((x) => parseInt(x, 10));
      dt = new Date(y, m - 1, d, 0, 0, 0, 0);
    } else {
      dt = new Date(trimmed);
    }
    return toLocalYmd(dt);
  } catch {
    return null;
  }
}

function getLocalTodayYmd(): [number, number, number] {
  const d = new Date();
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
}

export function labIsValidPerformedDate(iso: string | null | undefined): { ok: boolean; reason?: string } {
  if (!iso) return { ok: false, reason: 'تاریخ انجام را انتخاب کنید.' };
  const ymd = parseNominalYmd(iso);
  if (!ymd) return { ok: false, reason: 'تاریخ انجام معتبر نیست.' };
  const [py, pm, pd] = ymd;
  const [ty, tm, td] = getLocalTodayYmd();
  if (py > ty) return { ok: false, reason: 'تاریخ انجام نباید در آینده باشد.' };
  if (py === ty && pm > tm) return { ok: false, reason: 'تاریخ انجام نباید در آینده باشد.' };
  if (py === ty && pm === tm && pd > td) return { ok: false, reason: 'تاریخ انجام نباید در آینده باشد.' };
  return { ok: true };
}

export function labFormatFilterDate(iso: string | null): string {
  if (!iso) return '';
  const ymd = parseNominalYmd(iso);
  if (!ymd) return '';
  const [y, m, d] = ymd;
  try {
    const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
    return safeFormatJalali(dt, 'yyyy/MM/dd', '');
  } catch {
    return '';
  }
}

export function labEndOfDay(iso: string): Date | null {
  const ymd = parseNominalYmd(iso);
  if (!ymd) return null;
  const [y, m, d] = ymd;
  const dt = new Date(y, m - 1, d, 23, 59, 59, 999);
  return isNaN(dt.getTime()) ? null : dt;
}

export function labStartOfDay(iso: string): Date | null {
  const ymd = parseNominalYmd(iso);
  if (!ymd) return null;
  const [y, m, d] = ymd;
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
  return isNaN(dt.getTime()) ? null : dt;
}

export function LabDrawer({ title, description, children, onClose, busy = false }: {
  title: string; description: string; children: ReactNode; onClose: () => void; busy?: boolean;
}) {
  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
    <DialogContent dir="rtl" className="left-0 top-0 flex h-dvh max-h-dvh w-full max-w-2xl translate-x-0 translate-y-0 flex-col gap-4 overflow-y-auto rounded-none bg-slate-50 p-5 pt-14 text-right sm:rounded-none sm:p-8 sm:pt-14"
      onInteractOutside={(event) => event.preventDefault()} onEscapeKeyDown={(event) => { if (busy) event.preventDefault(); }}>
      <DialogTitle className="text-right text-xl text-slate-900">{title}</DialogTitle>
      <DialogDescription className="text-right text-slate-600">{description}</DialogDescription>
      {children}
    </DialogContent>
  </Dialog>;
}
export function LabField({ label, error, children, htmlFor }: { label: string; error?: string; children: ReactNode; htmlFor?: string }) {
  return <div className="min-w-0 space-y-2">
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700">{label}</label>
    {children}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </div>;
}
export function LabLoading() {
  return <div role="status" aria-label="در حال بارگذاری آزمایش‌ها" className="space-y-4">
    {[1, 2, 3].map((key) => <div key={key} className="h-32 animate-pulse rounded-[32px] bg-slate-200" />)}
  </div>;
}
export function LabError({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
    <p>{message}</p><PortalButton variant="outline" onClick={retry}>تلاش دوباره</PortalButton>
  </div>;
}
export function LabEmpty({ text = 'هنوز آزمایشی برای این بیمار ثبت نشده است.' }: { text?: string }) {
  return <div className={`${labCard} flex flex-col items-center gap-4 py-12 text-center`}>
    <FlaskConical className="h-10 w-10 text-teal-600" aria-hidden />
    <p>{text}</p>
  </div>;
}
export function LabStatus({ abnormal, hasRange = true }: { abnormal: boolean; hasRange?: boolean }) {
  return <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${abnormal ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'}`}>
    {abnormal && <AlertTriangle className="h-4 w-4 shrink-0" />}
    {abnormal ? 'خارج از محدوده مرجع' : hasRange ? 'در محدوده مرجع' : 'ثبت‌شده'}
  </span>;
}

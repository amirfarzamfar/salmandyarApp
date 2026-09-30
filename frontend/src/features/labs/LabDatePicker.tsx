'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-multi-date-picker';
import { Calendar, X as XIcon, ChevronDown } from 'lucide-react';
import DateObjectImport from 'react-date-object';
import persianCalendar from 'react-date-object/calendars/persian';
import persianFaLocale from 'react-date-object/locales/persian_fa';
import {
  parse as jalaliParse,
  isValid as jalaliIsValid,
  format as jalaliFormat,
} from 'date-fns-jalali';
import { cn } from '@/lib/utils';

const DateObject =
  ((DateObjectImport as any)?.default ?? DateObjectImport) as any;

type LabDatePickerProps = {
  value: string | null;
  onChange: (isoUtcDate: string | null) => void;
  placeholder?: string;
  label?: string;
  includeTime?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  maxDateIso?: string | null;
  /**
   * اگر true باشد: حداکثر تاریخ قابل انتخاب = امروز محلی سیستم
   * (بدون اختلاف UTC/Local و مستقل از maxDateIso)
   */
  maxTodayLocal?: boolean;
};

function gregorianIsoToJalaliDisplay(
  isoOrDate: string,
  includeTimePart = false
): string {
  try {
    if (!isoOrDate) return '';
    const trimmed = isoOrDate.trim();
    if (!trimmed) return '';

    let gDate: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [yStr, mStr, dStr] = trimmed.split('-');
      gDate = new Date(
        parseInt(yStr, 10),
        parseInt(mStr, 10) - 1,
        parseInt(dStr, 10),
        0, 0, 0, 0
      );
    } else {
      const parsed = new Date(trimmed);
      if (isNaN(parsed.getTime())) return '';
      gDate = new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate(),
        parsed.getHours(),
        parsed.getMinutes(),
        0, 0
      );
    }
    if (isNaN(gDate.getTime())) return '';
    return (
      jalaliFormat(
        gDate,
        includeTimePart ? 'yyyy/MM/dd HH:mm' : 'yyyy/MM/dd'
      ) || ''
    );
  } catch {
    return '';
  }
}

function gregorianIsoToJalaliDateObject(isoOrDate: string): any | null {
  try {
    if (!isoOrDate) return null;
    const trimmed = isoOrDate.trim();
    if (!trimmed) return null;

    let gDate: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [yStr, mStr, dStr] = trimmed.split('-');
      gDate = new Date(
        parseInt(yStr, 10),
        parseInt(mStr, 10) - 1,
        parseInt(dStr, 10),
        0, 0, 0, 0
      );
    } else {
      const parsed = new Date(trimmed);
      if (isNaN(parsed.getTime())) return null;
      gDate = new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate(),
        parsed.getHours(),
        parsed.getMinutes(),
        0, 0
      );
    }
    if (isNaN(gDate.getTime())) return null;

    // روش رسمی RMDP: یک Date JS معتبر را مستقیماً به سازنده پاس می‌دهیم
    // کتابخانه خودش تبدیل به تقویم شمسی انجام می‌دهد و اشتباه سال 0273 رخ نمی‌دهد
    const obj = new DateObject({
      date: gDate,
      calendar: persianCalendar,
      locale: persianFaLocale,
    });
    if (!obj || isNaN(obj.valueOf ? Number(obj.valueOf()) : 0)) return null;
    return obj;
  } catch {
    return null;
  }
}

export default function LabDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ...',
  label,
  includeTime = false,
  disabled = false,
  className,
  id,
  maxDateIso,
  maxTodayLocal = false,
}: LabDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<any>(null);

  useEffect(() => {
    const obj = gregorianIsoToJalaliDateObject(value ?? '');
    setInternalValue(obj);
  }, [value]);

  const displayValue = useMemo(
    () => (value ? gregorianIsoToJalaliDisplay(value, includeTime) : ''),
    [value, includeTime]
  );

  const maxDateObject = useMemo(() => {
    try {
      if (maxTodayLocal) {
        // روش مطمئن: مستقیماً از new Date() محلی استفاده می‌کنیم
        // → هیچ اختلاف UTC/Local رخ نمی‌دهد و امروز همیشه قابل انتخاب است
        const todayLocal = new Date();
        todayLocal.setHours(23, 59, 59, 999);
        const obj = new DateObject({
          date: todayLocal,
          calendar: persianCalendar,
          locale: persianFaLocale,
        });
        return obj || undefined;
      }
      if (maxDateIso) return gregorianIsoToJalaliDateObject(maxDateIso) || undefined;
      return undefined;
    } catch {
      return undefined;
    }
  }, [maxTodayLocal, maxDateIso]);

  const handlePickerChange = (dateObjArray: any) => {
    const original = Array.isArray(dateObjArray)
      ? dateObjArray[0]
      : dateObjArray;
    if (!original) {
      setInternalValue(null);
      onChange(null);
      return;
    }

    setInternalValue(original);

    try {
      // روش رسمی و ساده RMDP: خود کتابخانه DateObject را به Date JS تبدیل می‌کند
      // toDate همیشه یک Date معتبر میلادی برمی‌گرداند
      let asLocal: Date | null = null;
      if (typeof original.toDate === 'function') {
        try { asLocal = original.toDate(); } catch { asLocal = null; }
      }
      if (!asLocal || isNaN(asLocal.getTime())) {
        // Fallback A: convert gregorian + toDate
        let g = original;
        if (typeof original.convert === 'function') {
          try { g = original.convert('gregorian'); } catch { g = original; }
        }
        if (g && typeof g.toDate === 'function') {
          try { asLocal = g.toDate(); } catch { asLocal = null; }
        }
      }
      if (!asLocal || isNaN(asLocal.getTime())) {
        // Fallback B: از format String + date-fns-jalali (حالت اضطراری)
        const fmtFn = original.format;
        if (typeof fmtFn === 'function') {
          const formatted: string = fmtFn(includeTime ? 'YYYY/MM/DD HH:mm' : 'YYYY/MM/DD');
          const [dp, tp] = formatted.split(' ');
          const [y, m, d] = (dp || '').split('/').map((x) => parseInt(x, 10));
          if (y && m && d) {
            const base = new Date();
            const parsed = jalaliParse(dp, 'yyyy/MM/dd', base);
            if (jalaliIsValid(parsed)) {
              let h = 0, mm = 0;
              if (includeTime && tp) {
                const [hs, mss] = (tp || '00:00').split(':');
                h = parseInt(hs || '0', 10) || 0;
                mm = parseInt(mss || '0', 10) || 0;
              }
              parsed.setHours(h, mm, 0, 0);
              const utcIso = new Date(
                Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), h, mm, 0)
              ).toISOString();
              // eslint-disable-next-line no-console
              console.debug('[LAB-DP] onChange (jalali-string fallback):', utcIso, {formatted});
              onChange(utcIso);
              return;
            }
          }
        }
        // eslint-disable-next-line no-console
        console.debug('[LAB-DP] onChange: invalid → null (all fallbacks)');
        onChange(null);
        return;
      }

      // حالا asLocal یک Date معتبر محلی (Local) است. برای خروجی ISO UTC:
      let hours = asLocal.getHours();
      let minutes = asLocal.getMinutes();
      if (!includeTime) { hours = 0; minutes = 0; }
      const utcIso = new Date(
        Date.UTC(
          asLocal.getFullYear(),
          asLocal.getMonth(),
          asLocal.getDate(),
          hours,
          minutes,
          0
        )
      ).toISOString();
      // eslint-disable-next-line no-console
      console.debug('[LAB-DP] onChange (official toDate):', utcIso, {local: asLocal.toString()});
      onChange(utcIso);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[LAB-DP] onChange exception:', err);
      onChange(null);
    }
  };

  return (
    <div className={cn('space-y-2 w-full', className)}>
      {label && (
        <label className="text-xs font-bold text-slate-600 block inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-teal-500" />
          {label}
        </label>
      )}

      <DatePicker
        value={internalValue}
        onChange={handlePickerChange}
        calendar={persianCalendar}
        locale={persianFaLocale}
        format={includeTime ? 'YYYY/MM/DD HH:mm' : 'YYYY/MM/DD'}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        maxDate={maxDateObject}
        portal
        inputMode="none"
        disabled={disabled}
        render={(_value, openCalendar) => {
          const hasValue = !!displayValue;

          return (
            <button
              type="button"
              id={id}
              disabled={disabled}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!disabled) openCalendar();
              }}
              className={cn(
                'group relative flex w-full items-center rounded-2xl border border-gray-200 bg-white text-right shadow-xs transition-all',
                'h-12 px-0',
                !disabled &&
                  'cursor-pointer hover:border-teal-300 hover:shadow-sm',
                disabled && 'opacity-60 cursor-not-allowed bg-gray-50',
                isOpen &&
                  '!border-teal-500 !ring-4 !ring-teal-500/10 shadow-md'
              )}
              aria-haspopup="dialog"
              aria-expanded={isOpen}
            >
              <div
                className="flex h-full items-center border-r border-gray-200 px-3.5 bg-slate-50 text-slate-500 transition-colors"
                aria-hidden
              >
                <Calendar className="h-4 w-4 text-teal-600" />
              </div>

              <div
                dir="ltr"
                className={cn(
                  'flex-1 min-w-0 flex items-center justify-center px-3 py-2',
                  'select-none'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-mono tracking-wide truncate',
                    hasValue ? 'text-slate-800' : 'text-gray-400 italic'
                  )}
                  title={hasValue ? displayValue : placeholder}
                >
                  {hasValue ? displayValue : placeholder}
                </span>
              </div>

              {!disabled && hasValue && (
                <div
                  className="h-full flex items-center border-l border-gray-100 px-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setInternalValue(null);
                    onChange(null);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="پاک کردن تاریخ"
                >
                  <XIcon className="h-4 w-4" />
                </div>
              )}

              <div
                className={cn(
                  'h-full flex items-center pr-3 pl-2 text-slate-400 transition-transform',
                  isOpen && 'rotate-180 text-teal-600'
                )}
                aria-hidden
              >
                <ChevronDown className="h-4 w-4" />
              </div>
            </button>
          );
        }}
      />
    </div>
  );
}

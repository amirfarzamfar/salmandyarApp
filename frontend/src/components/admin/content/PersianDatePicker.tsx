'use client';

import React, { useMemo, useRef, useState } from 'react';
import DatePicker from 'react-multi-date-picker';
import { Calendar, X as XIcon } from 'lucide-react';
import DateObjectImport from 'react-date-object';
import persianCalendar from 'react-date-object/calendars/persian';
import persianFaLocale from 'react-date-object/locales/persian_fa';
import { parse as jalaliParse, isValid as jalaliIsValid, format as jalaliFormat } from 'date-fns-jalali';
import { parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const DateObject = ((DateObjectImport as any)?.default ?? DateObjectImport) as any;

function normalizeDigits(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[۰-۹]/g, (digit) =>
      String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))
  );
}

type Props = {
  value: string | null;
  onChange: (isoUtcDate: string | null) => void;
  placeholder?: string;
  label?: string;
  includeTime?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
};

// ==========================================================================
// PREFERRED PROJECT STANDARD: date-fns-jalali conversion (per guest-requests page)
// This is the ONLY correct conversion in this codebase.
// react-date-object's .convert() does NOT translate numeric year/month/day —
// it only sets a .calendar label while preserving Persian numbers (1404 stays 1404
// instead of becoming 2025).
// ==========================================================================

function gregorianIsoToJalaliDisplay(isoOrDate: string, includeTimePart = false): string {
  try {
    if (!isoOrDate) return '';
    const trimmed = isoOrDate.trim();
    if (!trimmed) return '';

    let gDate: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      gDate = parseISO(trimmed);
    } else {
      gDate = new Date(trimmed);
      if (isNaN(gDate.getTime())) return '';
    }

    const jDisplay = jalaliFormat(gDate, includeTimePart ? 'yyyy/MM/dd HH:mm' : 'yyyy/MM/dd');
    return jDisplay || '';
  } catch {
    return '';
  }
}

function jalaliDisplayToGregorianIsoUtc(jalaliDisplay: string, includeTimePart = false): string | null {
  try {
    const clean = normalizeDigits(jalaliDisplay.trim()); if (!clean) return null;
    const dateTimeParts = clean.split(/\s+/);
    const datePart = dateTimeParts[0] || '';
    const timePart = includeTimePart ? (dateTimeParts[1] || '00:00') : '00:00';
    if (!datePart) return null;

    const baseDate = new Date();
    const parsed = jalaliParse(datePart, 'yyyy/MM/dd', baseDate);
    if (!jalaliIsValid(parsed)) return null;

    const [hhStr, mmStr] = (timePart || '00:00').split(':');
    const hh = parseInt(normalizeDigits(hhStr || '0'), 10) || 0;
    const mm = parseInt(normalizeDigits(mmStr || '0'), 10) || 0;
    parsed.setHours(hh, mm, 0, 0);

    const gy = parsed.getFullYear();
    const gm = parsed.getMonth() + 1;
    const gd = parsed.getDate();
    const gh = parsed.getHours();
    const gmin = parsed.getMinutes();
    const result = new Date(Date.UTC(gy, gm - 1, gd, gh, gmin, 0));
    if (isNaN(result.getTime())) return null;
    return result.toISOString();
  } catch {
    return null;
  }
}

function gregorianIsoToJalaliDateObject(isoOrDate: string): any | null {
  try {
    if (!isoOrDate) return null;
    const trimmed = isoOrDate.trim(); if (!trimmed) return null;
    const gDate = /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? parseISO(trimmed) : new Date(trimmed);
    if (isNaN(gDate.getTime())) return null;
    const jDisplay = jalaliFormat(gDate, 'yyyy/MM/dd');
    if (!jDisplay) return null;
    const [jyStr, jmStr, jdStr] = jDisplay.split('/');
    const jy = parseInt(jyStr, 10); const jm = parseInt(jmStr, 10); const jd = parseInt(jdStr, 10);
    if (!jy || !jm || !jd) return null;
    return new DateObject({
      calendar: persianCalendar, locale: persianFaLocale,
      year: jy, month: jm, day: jd,
    });
  } catch {
    return null;
  }
}

export default function PersianDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ...',
  label,
  includeTime = false,
  disabled = false,
  className,
  id,
}: Props) {
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.__PDP_V3_LOADED__ = true;
  }
  console.log('[PDP-V3] Mounting PersianDatePicker v3 (combobox-arch) value=', value);
  const [isOpen, setIsOpen] = useState(false);
  const datePickerRef = useRef<any>(null);

  const displayValue = useMemo(() => {
    return value ? gregorianIsoToJalaliDisplay(value, includeTime) : '';
  }, [value, includeTime]);

  const pickerValue = useMemo(
    () => gregorianIsoToJalaliDateObject(value ?? ''),
    [value]
  );

  const handlePickerChange = (dateObjArray: any) => {
    const dateObj = Array.isArray(dateObjArray) ? dateObjArray[0] : dateObjArray;
    if (!dateObj) {
      onChange(null);
      return;
    }
    try {
      let year: number, month: number, day: number;
      const formatted =
        typeof dateObj.format === 'function' ? dateObj.format('YYYY/MM/DD') : '';
      const parts = formatted.split('/');
      if (parts.length === 3) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else {
        year = dateObj.year;
        month = dateObj.month?.number || dateObj.month;
        day = dateObj.day;
      }
      if (!year || !month || !day) return;
      const jmStr = String(month).padStart(2, '0');
      const jdStr = String(day).padStart(2, '0');
      const displayDate = `${year}/${jmStr}/${jdStr}`;

      const iso = jalaliDisplayToGregorianIsoUtc(displayDate, includeTime);
      if (iso) {
        onChange(iso);
      } else {
        onChange(null);
      }
      try { datePickerRef.current?.closeCalendar?.(); } catch {}
    } catch {
      // ignore
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleTrigger = () => {
    if (disabled) return;
    try {
      if (!isOpen) datePickerRef.current?.openCalendar?.();
      else datePickerRef.current?.closeCalendar?.();
    } catch {}
  };

  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      handleTrigger();
    } else if (e.key === 'Escape') {
      try { datePickerRef.current?.closeCalendar?.(); } catch {}
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
        ref={datePickerRef}
        value={pickerValue}
        onChange={handlePickerChange}
        calendar={persianCalendar}
        locale={persianFaLocale}
        format="YYYY/MM/DD"
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        portal
        inputClass="!hidden"
        containerStyle={{ display: 'inline-block', width: '0', height: '0', overflow: 'hidden' }}
        style={{ display: 'none' }}
      />

      <div
        id={id}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={undefined}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleContainerKeyDown}
        onClick={handleTrigger}
        className={cn(
          'flex items-stretch overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all select-none',
          !disabled && 'focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 cursor-pointer hover:border-teal-300',
          disabled && 'opacity-60 cursor-not-allowed bg-gray-50',
          isOpen && 'border-teal-500 ring-4 ring-teal-500/10'
        )}
      >
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={(e) => { e.stopPropagation(); handleTrigger(); }}
          className={cn(
            'px-3.5 bg-slate-50 text-slate-500 flex items-center border-r border-gray-200 transition-colors',
            !disabled && 'hover:bg-slate-100'
          )}
          aria-label="باز کردن انتخاب‌گر تاریخ"
        >
          <Calendar className="h-4 w-4 text-teal-600" />
        </button>
        <div className="flex-1 flex items-center px-4 py-2.5">
          <span
            dir="ltr"
            className={cn(
              'text-sm font-mono tracking-wide text-center flex-1',
              displayValue ? 'text-slate-700' : 'text-gray-400'
            )}
          >
            {displayValue || placeholder}
          </span>
        </div>
        {!disabled && displayValue && (
          <button
            type="button"
            onClick={handleClear}
            tabIndex={-1}
            className="px-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex items-center"
            aria-label="پاک کردن تاریخ"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

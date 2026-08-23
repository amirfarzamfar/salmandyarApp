'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import DatePicker from 'react-multi-date-picker';
import { Calendar } from 'lucide-react';
import DateObject from 'react-date-object';
import persianCalendar from 'react-date-object/calendars/persian';
import persianFaLocale from 'react-date-object/locales/persian_fa';

type Props = {
  value: string | null;
  onChange: (isoUtcDate: string | null) => void;
  placeholder?: string;
  label?: string;
  includeTime?: boolean;
};

function gregorianToJalaliIso(dateIso: string): string {
  try {
    const d = new Date(dateIso);
    if (isNaN(d.getTime())) return '';
    const gYear = d.getUTCFullYear();
    const gMonth = d.getUTCMonth() + 1;
    const gDay = d.getUTCDate();
    const hh = d.getUTCHours();
    const mm = d.getUTCMinutes();

    const result = convertGregorianToJalali(gYear, gMonth, gDay);
    if (!result) return '';
    const [jy, jm, jd] = result;
    const jmStr = String(jm).padStart(2, '0');
    const jdStr = String(jd).padStart(2, '0');
    const hhStr = String(hh).padStart(2, '0');
    const mmStr = String(mm).padStart(2, '0');
    return `${jy}/${jmStr}/${jdStr} ${hhStr}:${mmStr}`;
  } catch {
    return '';
  }
}

function jalaliStrToGregorianIsoUtc(jalaliStr: string, includeTime = false): string | null {
  try {
    const clean = jalaliStr.trim();
    if (!clean) return null;

    const dateTimeParts = clean.split(/\s+/);
    const datePart = dateTimeParts[0] || '';
    const timePart = dateTimeParts[1] || '00:00';
    const [jyStr, jmStr, jdStr] = datePart.split(/[-/]/);
    if (!jyStr || !jmStr || !jdStr) return null;
    const jy = parseInt(jyStr, 10);
    const jm = parseInt(jmStr, 10);
    const jd = parseInt(jdStr, 10);

    const [hhStr, mmStr] = (timePart || '00:00').split(':');
    const hh = parseInt(hhStr || '0', 10) || 0;
    const mm = parseInt(mmStr || '0', 10) || 0;

    const gregorian = convertJalaliToGregorian(jy, jm, jd);
    if (!gregorian) return null;
    const [gYear, gMonth, gDay] = gregorian;

    const result = new Date(Date.UTC(gYear, gMonth - 1, gDay, hh, mm, 0));
    if (isNaN(result.getTime())) return null;
    return result.toISOString();
  } catch {
    return null;
  }
}

function convertGregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] | null {
  try {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    if (gy > 1600) {
      let jy = 979;
      gy -= 1600;
      const g2 = gy % 4 === 0 ? 366 : 365;
      let days =
        365 * gy +
        Math.floor((gy + 3) / 4) -
        Math.floor((gy + 99) / 100) +
        Math.floor((gy + 399) / 400) +
        gd +
        g_d_m[gm - 1] -
        (g2 === 366 && gm > 2 ? 1 : 0);
      jy += 33 * Math.floor(days / 12053);
      days = days % 12053;
      jy += 4 * Math.floor(days / 1461);
      days = days % 1461;
      if (days > 365) {
        jy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
      }
      const jm =
        days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
      const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
      return [jy, jm, jd];
    } else {
      return null;
    }
  } catch {
    return null;
  }
}

function convertJalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] | null {
  try {
    if (jy > 979) {
      let gy = 1600;
      jy -= 979;
      let days =
        365 * jy +
        Math.floor(jy / 33) * 8 +
        Math.floor(((jy % 33) + 3) / 4) +
        jd +
        (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186) -
        355666 +
        365236 -
        1595;
      gy += 400 * Math.floor(days / 146097);
      days %= 146097;
      if (days > 36524) {
        gy += 100 * Math.floor(--days / 36524);
        days %= 36524;
        if (days >= 365) days++;
      }
      gy += 4 * Math.floor(days / 1461);
      days %= 1461;
      if (days > 365) {
        gy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
      }
      let gd = days + 1;
      const sal_a = [
        31,
        (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
      ];
      let gm = 0;
      for (gm = 0; gm < 12 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
      return [gy, gm + 1, gd];
    }
    return null;
  } catch {
    return null;
  }
}

export default function PersianDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ...',
  label,
  includeTime = true,
}: Props) {
  const [displayValue, setDisplayValue] = useState<string>(value ? gregorianToJalaliIso(value) : '');
  const pickerValueRef = useRef<any>(null);

  useEffect(() => {
    if (value) {
      setDisplayValue(gregorianToJalaliIso(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const jalaliParts = useMemo(() => {
    if (!displayValue) return null;
    const iso = jalaliStrToGregorianIsoUtc(displayValue, includeTime);
    if (!iso) return null;
    try {
      const clean = displayValue.trim();
      const dateTimeParts = clean.split(/\s+/);
      const datePart = dateTimeParts[0] || '';
      const [jyStr, jmStr, jdStr] = datePart.split(/[-/]/);
      if (!jyStr || !jmStr || !jdStr) return null;
      return {
        year: parseInt(jyStr, 10),
        month: parseInt(jmStr, 10),
        day: parseInt(jdStr, 10),
      };
    } catch {
      return null;
    }
  }, [displayValue, includeTime]);

  const pickerValue = useMemo(() => {
    if (!jalaliParts) return null;
    try {
      return new DateObject({
        calendar: persianCalendar,
        locale: persianFaLocale,
        year: jalaliParts.year,
        month: jalaliParts.month,
        day: jalaliParts.day,
      });
    } catch {
      return null;
    }
  }, [jalaliParts]);

  const handlePickerChange = (dateObjArray: any) => {
    const dateObj = Array.isArray(dateObjArray) ? dateObjArray[0] : dateObjArray;
    if (!dateObj) {
      onChange(null);
      setDisplayValue('');
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
      const formattedStr = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
      const now = new Date();
      const timeStr = includeTime
        ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        : '00:00';
      const display = includeTime ? `${formattedStr} ${timeStr}` : formattedStr;
      setDisplayValue(display);
      const iso = jalaliStrToGregorianIsoUtc(display, includeTime);
      onChange(iso);
    } catch {
      // ignore
    }
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setDisplayValue(v);
    if (!v.trim()) {
      onChange(null);
      return;
    }
    const iso = jalaliStrToGregorianIsoUtc(v, includeTime);
    if (iso) onChange(iso);
  };

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-xs font-bold text-slate-600 block inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-teal-500" />
          {label}
        </label>
      )}
      <div className="relative">
        <div className="flex items-stretch overflow-hidden rounded-2xl border border-gray-200 bg-white focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
          <DatePicker
            ref={pickerValueRef}
            value={pickerValue}
            onChange={handlePickerChange}
            calendar={persianCalendar}
            locale={persianFaLocale}
            inputClass="!hidden"
            format="YYYY/MM/DD"
            containerClassName="!w-0 !h-0 !p-0 !m-0 !overflow-hidden !absolute"
            className="!hidden"
          />
          <input
            type="text"
            value={displayValue}
            onChange={handleManualChange}
            dir="ltr"
            placeholder={placeholder}
            className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none font-mono text-slate-700 text-center tracking-wide"
          />
          <DatePicker
            value={pickerValue}
            onChange={handlePickerChange}
            calendar={persianCalendar}
            locale={persianFaLocale}
            format="YYYY/MM/DD"
          >
            <button
              type="button"
              className="px-3.5 bg-slate-50 text-slate-500 flex items-center border-r border-gray-200 cursor-pointer hover:bg-slate-100 transition-colors"
              aria-label="انتخاب تاریخ"
            >
              <Calendar className="h-4 w-4 text-teal-600" />
            </button>
          </DatePicker>
        </div>
      </div>
    </div>
  );
}

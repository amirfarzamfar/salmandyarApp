'use client';

import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
} from 'lucide-react';
import { CareServiceStatus, type CalendarEventDto } from '@/types/patient-service';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SimpleCalendarViewProps {
  events: CalendarEventDto[];
  onEventClick: (serviceId: number) => void;
}

const statusColorMap: Record<CareServiceStatus, { bg: string; text: string; border: string; dot: string }> = {
  [CareServiceStatus.Draft]: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400' },
  [CareServiceStatus.Scheduled]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'bg-yellow-500' },
  [CareServiceStatus.Pending]: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500' },
  [CareServiceStatus.Assigned]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-500' },
  [CareServiceStatus.Accepted]: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300', dot: 'bg-indigo-500' },
  [CareServiceStatus.InProgress]: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300', dot: 'bg-cyan-500' },
  [CareServiceStatus.Completed]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', dot: 'bg-green-500' },
  [CareServiceStatus.Cancelled]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-500' },
  [CareServiceStatus.NoShow]: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-500' },
  [CareServiceStatus.Expired]: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', dot: 'bg-slate-500' },
};

const weekdayNamesFa = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
const monthNamesFa = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
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
    const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
    return [jy, jm, jd];
  }
  return [0, 0, 0];
}

function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
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
      31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
      31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
    ];
    let gm = 0;
    for (gm = 0; gm < 12 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
    return [gy, gm + 1, gd];
  }
  return [0, 0, 0];
}

function daysInJalaliMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  const isLeap = ((jy - 979) % 33 % 4 === 1) ? false : true;
  return isLeap ? 30 : 29;
}

export default function SimpleCalendarView({ events, onEventClick }: SimpleCalendarViewProps) {
  const today = new Date();
  const todayJalali = gregorianToJalali(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );

  const [viewYear, setViewYear] = useState(todayJalali[0]);
  const [viewMonth, setViewMonth] = useState(todayJalali[1]);

  const daysInMonth = daysInJalaliMonth(viewYear, viewMonth);
  const firstDayGregorian = jalaliToGregorian(viewYear, viewMonth, 1);
  const firstDayDate = new Date(firstDayGregorian[0], firstDayGregorian[1] - 1, firstDayGregorian[2]);
  const firstDayOfWeek = (firstDayDate.getDay() + 1) % 7;

  const cells = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    while (arr.length < 42) arr.push(null);
    return arr;
  }, [firstDayOfWeek, daysInMonth]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEventDto[]>();
    events.forEach((ev) => {
      try {
        const d = new Date(ev.start);
        const j = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
        const key = `${j[0]}-${j[1]}-${j[2]}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(ev);
      } catch {
          // ignore
        }
    });
    return map;
  }, [events]);

  const isToday = (day: number): boolean => {
    return day === todayJalali[2] && viewMonth === todayJalali[1] && viewYear === todayJalali[0];
  };

  const goPrevious = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goToday = () => {
    setViewYear(todayJalali[0]);
    setViewMonth(todayJalali[1]);
  };

  const eventsForDay = (day: number) => {
    const key = `${viewYear}-${viewMonth}-${day}`;
    return eventsByDay.get(key) || [];
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm" dir="rtl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-l from-teal-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
            <CalendarIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {monthNamesFa[viewMonth - 1]} {viewYear}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToday}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors border border-teal-200"
          >
            امروز
          </button>
          <div className="flex items-center gap-0.5 mr-2">
            <button
              type="button"
              onClick={goNext}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="ماه بعد"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <button
              type="button"
              onClick={goPrevious}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="ماه قبل"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
        {weekdayNamesFa.map((name) => (
          <div
            key={name}
            className="px-2 py-2.5 text-center text-xs font-bold text-gray-500 border-l border-gray-100 last:border-l-0"
          >
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          const dayEvents = day != null ? eventsForDay(day) : [];
          const cellIsToday = day != null && isToday(day);
          const hasEvents = dayEvents.length > 0;

          return (
            <div
              key={idx}
              className={cn(
                'min-h-[110px] border-l border-t border-gray-100 p-1.5 relative',
                'first:border-l-0',
                idx < 7 && 'border-t-0',
                day == null && 'bg-gray-50/40'
              )}
            >
              {day != null && (
                <>
                  <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full transition-colors',
                      cellIsToday
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/50'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {day}
                  </span>
                  {hasEvents && (
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0 h-5 min-w-[18px"
                    >
                      {dayEvents.length}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((ev) => {
                  const colors = statusColorMap[ev.status] || statusColorMap[CareServiceStatus.Scheduled];
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => onEventClick(ev.serviceId)}
                    className={cn(
                      'w-full text-right px-1.5 py-1 rounded-md border text-[11px] leading-tight truncate transition-all hover:shadow-md hover:scale-[1.02] hover:z-10',
                      colors.bg,
                      colors.text,
                      colors.border
                    )}
                    title={`${ev.title} - ${ev.patientFullName}`}
                    >
                      <div className="flex items-center gap-1 truncate">
                      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', colors.dot)} />
                      <span className="font-semibold truncate">{ev.title}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 opacity-80 text-[10px]">
                        <Clock className="w-2.5 h-2.5" />
                        <span className="truncate">
                          {ev.start ? new Date(ev.start).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </button>
                  );
                })}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-gray-400 text-center py-0.5">
                      +{dayEvents.length - 3} مورد دیگر
                    </div>
                  )}
                </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="text-xs text-gray-600">برنامه‌ریزی شده</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
          <span className="text-xs text-gray-600">در حال انجام</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-xs text-gray-600">تکمیل شده</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-xs text-gray-600">لغو شده</span>
        </div>
        <div className="mr-auto flex items-center gap-1 text-xs text-gray-500">
          <User className="w-3 h-3" />
          <span>مجموع رویدادها: {events.length}</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AssignmentDto, AssignmentStatus, ShiftSlot } from "@/types/assignment";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { faIR } from "date-fns/locale";
import { User, Stethoscope, Clock, CalendarDays, Timer, LogOut, Undo2, Loader2 } from "lucide-react";
import {
  computeAssignmentStatus,
  getAssignmentStatusPresentation,
  getAssignmentTimings,
  getAssignmentRemainingText,
} from "@/lib/assignment-status";

interface CaregiverScheduleProps {
  assignments: AssignmentDto[];
  onEdit?: (assignment: AssignmentDto) => void;
  currentDate?: Date;
  onCloseShift?: (assignment: AssignmentDto) => void;
  onReopenShift?: (assignment: AssignmentDto) => void;
  reopenIsLoading?: boolean;
}

export function CaregiverSchedule({ assignments, onEdit, currentDate = new Date(), onCloseShift, onReopenShift, reopenIsLoading }: CaregiverScheduleProps) {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 6 }); // Saturday start
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  const [nowTick, setNowTick] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(new Date()), 30 * 1000);
    return () => window.clearInterval(id);
  }, []);

  const getAssignmentsForDay = (date: Date) => {
    return assignments.filter(a => {
      const start = new Date(a.startDate);
      return isSameDay(date, start); 
    });
  };

  const formatPersianDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long', day: 'numeric' }).format(date);
  };

  const getShiftSlotLabel = (slot?: ShiftSlot) => {
    if (slot === undefined || slot === null) return "نامشخص";
    switch(slot) {
      case ShiftSlot.Morning: return "صبح";
      case ShiftSlot.Evening: return "عصر";
      case ShiftSlot.Night: return "شب";
      case ShiftSlot.Long: return "لانگ";
      case ShiftSlot.TwentyFourHour: return "۲۴ ساعته";
      default: return "نامشخص";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50 md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-gray-700 dark:text-gray-200">برنامه هفتگی</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">برای مشاهده جزئیات هر روز اسکرول کنید.</div>
          </div>
          <div className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-200">
            {assignments.length} تخصیص
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 md:hidden">
        {days.map(day => {
          const dayAssignments = getAssignmentsForDay(day);
          return (
            <div key={day.toString()} className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40">
              <div className="mb-3 flex items-start justify-between gap-3 border-b border-gray-200 pb-3 dark:border-gray-700">
                <div>
                  <div className="font-bold text-gray-700 dark:text-gray-200">{format(day, 'EEEE', { locale: faIR })}</div>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{formatPersianDate(day)}</div>
                </div>
                <div className="rounded-full bg-white px-2.5 py-1 text-xs text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-300">
                  {dayAssignments.length} مورد
                </div>
              </div>

              {dayAssignments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-sm text-gray-400 dark:border-gray-700 dark:text-gray-500">
                  تخصیصی برای این روز ثبت نشده است.
                </div>
              ) : (
                <div className="space-y-3">
                  {dayAssignments.map(assignment => {
                    const computed = computeAssignmentStatus(assignment, nowTick);
                    const pres = getAssignmentStatusPresentation(computed);
                    const timings = getAssignmentTimings(assignment);
                    const showBadge = computed !== 'Completed' && computed !== 'Cancelled';
                    return (
                      <div
                        key={assignment.id}
                        onClick={() => onEdit?.(assignment)}
                        className={`cursor-pointer rounded-xl border p-3 text-xs font-medium transition-all hover:shadow-md ${pres.accentSoftClass}`}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2 border-b border-black/5 pb-1.5 dark:border-white/10">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Stethoscope size={14} className="shrink-0 text-teal-600 dark:text-teal-400" />
                            <span className="truncate font-bold">{assignment.caregiverName}</span>
                          </div>
                          {showBadge && (
                            <span className={`shrink-0 inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-black ${pres.badgeClass}`}>
                              {pres.shortLabel}
                            </span>
                          )}
                        </div>
                        <div className="mb-2 flex items-center gap-1.5">
                          <User size={14} className="shrink-0 text-gray-500 dark:text-gray-400" />
                          <span className="truncate opacity-90">{assignment.patientName}</span>
                        </div>
                        <div className="mt-2 space-y-2 border-t border-black/5 pt-2 dark:border-white/10">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex w-fit items-center gap-1.5 rounded bg-black/5 px-1.5 py-0.5 text-[10px] opacity-90 dark:bg-white/5">
                              <Clock size={10} />
                              <span>{format(timings.start, 'HH:mm')} — {format(timings.effectiveEnd, 'HH:mm')}</span>
                            </div>
                            {assignment.shiftSlot !== undefined && assignment.shiftSlot !== ShiftSlot.None && (
                              <div className="flex w-fit items-center gap-1.5 rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                                <CalendarDays size={10} />
                                <span>شیفت {getShiftSlotLabel(assignment.shiftSlot)}</span>
                              </div>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 text-[10px] font-bold ${pres.accentClass}`}>
                            <Timer size={10} />
                            <span>{getAssignmentRemainingText(assignment, nowTick)}</span>
                          </div>
                        </div>
                        {(onCloseShift || onReopenShift) && (
                          <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/10">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {onCloseShift && (computed === 'Active' || computed === 'ExpiredButNotClosed' || computed === 'Upcoming') && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); onCloseShift(assignment); }}
                                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition-colors ${
                                    computed === 'ExpiredButNotClosed'
                                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                  }`}
                                >
                                  <LogOut size={11} />
                                  بستن شیفت
                                </button>
                              )}
                              {onReopenShift && (computed === 'Completed' || computed === 'Cancelled' || computed === 'Suspended') && (
                                <button
                                  type="button"
                                  disabled={reopenIsLoading}
                                  onClick={(e) => { e.stopPropagation(); onReopenShift(assignment); }}
                                  className="inline-flex items-center gap-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 px-2 py-1 text-[10px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {reopenIsLoading ? <Loader2 size={11} className="animate-spin" /> : <Undo2 size={11} />}
                                  باز کردن
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden md:grid md:grid-cols-7 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        {days.map(day => (
          <div key={day.toString()} className="p-4 text-center border-l dark:border-gray-700 last:border-l-0">
            <div className="font-bold text-gray-700 dark:text-gray-200">{format(day, 'EEEE', { locale: faIR })}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatPersianDate(day)}</div>
          </div>
        ))}
      </div>
      
      <div className="hidden min-h-[400px] md:grid md:grid-cols-7">
        {days.map(day => {
          const dayAssignments = getAssignmentsForDay(day);
          return (
            <div key={day.toString()} className="border-l dark:border-gray-700 last:border-l-0 p-2 space-y-2 bg-white dark:bg-gray-800">
              {dayAssignments.map(assignment => {
                const computed = computeAssignmentStatus(assignment, nowTick);
                const pres = getAssignmentStatusPresentation(computed);
                const timings = getAssignmentTimings(assignment);
                const showBadge = computed !== 'Completed' && computed !== 'Cancelled';
                return (
                  <div
                    key={assignment.id}
                    onClick={() => onEdit?.(assignment)}
                    className={`p-2.5 rounded-xl text-xs font-medium cursor-pointer hover:shadow-md transition-all border ${pres.accentSoftClass}`}
                  >
                    {/* Caregiver Row + Status Badge */}
                    <div className="flex items-start justify-between gap-1.5 mb-1.5 pb-1.5 border-b border-black/5 dark:border-white/10">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Stethoscope size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="font-bold truncate">{assignment.caregiverName}</span>
                      </div>
                      {showBadge && (
                        <span className={`shrink-0 inline-flex items-center rounded border px-1 py-0.5 text-[9px] font-black leading-none ${pres.badgeClass}`} title={pres.label}>
                          {pres.shortLabel}
                        </span>
                      )}
                    </div>

                    {/* Patient Row */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <User size={14} className="text-gray-500 dark:text-gray-400 shrink-0" />
                      <span className="truncate opacity-90">{assignment.patientName}</span>
                    </div>

                    {/* Shift/Time Row */}
                    <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-black/5 dark:border-white/10">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 text-[10px] opacity-90 bg-black/5 dark:bg-white/5 rounded px-1.5 py-0.5 w-fit">
                          <Clock size={10} />
                          <span>{format(timings.start, 'HH:mm')}–{format(timings.effectiveEnd, 'HH:mm')}</span>
                        </div>
                        {assignment.shiftSlot !== undefined && assignment.shiftSlot !== ShiftSlot.None && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/50 rounded px-1.5 py-0.5 w-fit">
                            <CalendarDays size={10} />
                            <span>{getShiftSlotLabel(assignment.shiftSlot)}</span>
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] font-bold ${pres.accentClass}`}>
                        <Timer size={10} />
                        <span>{getAssignmentRemainingText(assignment, nowTick)}</span>
                      </div>
                    </div>
                    {(onCloseShift || onReopenShift) && (
                      <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/10">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {onCloseShift && (computed === 'Active' || computed === 'ExpiredButNotClosed' || computed === 'Upcoming') && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onCloseShift(assignment); }}
                              className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold transition-colors ${
                                computed === 'ExpiredButNotClosed'
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                              title="بستن و علامت‌گذاری پایان شیفت"
                            >
                              <LogOut size={10} />
                              بستن
                            </button>
                          )}
                          {onReopenShift && (computed === 'Completed' || computed === 'Cancelled' || computed === 'Suspended') && (
                            <button
                              type="button"
                              disabled={reopenIsLoading}
                              onClick={(e) => { e.stopPropagation(); onReopenShift(assignment); }}
                              className="inline-flex items-center gap-0.5 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 px-1.5 py-0.5 text-[9px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="باز کردن مجدد شیفت"
                            >
                              {reopenIsLoading ? <Loader2 size={10} className="animate-spin" /> : <Undo2 size={10} />}
                              باز
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

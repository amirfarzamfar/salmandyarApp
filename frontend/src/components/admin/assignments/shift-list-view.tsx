"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { assignmentService } from "@/services/assignment.service";
import { AssignmentDto, AssignmentStatus, ShiftSlot } from "@/types/assignment";
import { format } from "date-fns-jalali";
import { Stethoscope, User, Clock, CalendarDays, History, Edit, ChevronLeft, ChevronRight, Timer, LogOut, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  computeAssignmentStatus,
  getAssignmentRemainingText,
  getAssignmentStatusPresentation,
  getAssignmentTimings,
} from "@/lib/assignment-status";

interface ShiftListViewProps {
  search?: string;
  patientId?: string;
  caregiverId?: string;
  status?: AssignmentStatus;
  start?: string;
  end?: string;
  onEdit: (assignment: AssignmentDto) => void;
  onViewHistory: (assignment: AssignmentDto) => void;
  onCloseShift?: (assignment: AssignmentDto) => void;
  onReopenShift?: (assignment: AssignmentDto) => void;
  reopenIsLoading?: boolean;
}

export function ShiftListView({ search, patientId, caregiverId, status, start, end, onEdit, onViewHistory, onCloseShift, onReopenShift, reopenIsLoading }: ShiftListViewProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [nowTick, setNowTick] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(new Date()), 30 * 1000);
    return () => window.clearInterval(id);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['assignments-paged', page, pageSize, search, patientId, caregiverId, status, start, end],
    queryFn: () => assignmentService.getPaged({
      page,
      pageSize,
      search,
      patientId: patientId ? parseInt(patientId) : undefined,
      caregiverId,
      status,
      start,
      end
    })
  });

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

  if (isLoading) return <div className="py-10 text-center text-gray-500">در حال بارگذاری...</div>;

  const items = data?.items || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">بازه زمانی</th>
              <th className="px-4 py-3">پرستار / سالمندیار</th>
              <th className="px-4 py-3">بیمار</th>
              <th className="px-4 py-3">شیفت</th>
              <th className="px-4 py-3">وضعیت نمایشی</th>
              <th className="px-4 py-3">زمان‌بندی</th>
              <th className="px-4 py-3 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">موردی یافت نشد.</td>
              </tr>
            ) : items.map((a) => {
              const computed = computeAssignmentStatus(a, nowTick);
              const pres = getAssignmentStatusPresentation(computed);
              const timings = getAssignmentTimings(a);
              const originalStatus = (() => {
                switch (a.status) {
                  case AssignmentStatus.Active: return 'فعال';
                  case AssignmentStatus.Completed: return 'پایان‌یافته';
                  case AssignmentStatus.Cancelled: return 'لغو شده';
                  case AssignmentStatus.Suspended: return 'معلق';
                  default: return 'نامشخص';
                }
              })();
              return (
                <tr
                  key={a.id}
                  className={`border-b dark:border-gray-700 transition-colors ${
                    computed === 'ExpiredButNotClosed'
                      ? 'bg-amber-50/40 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white leading-tight">
                      {format(timings.start, 'yyyy/MM/dd HH:mm')}
                    </div>
                    <div className="mt-1 text-[11px] text-gray-500 flex items-center gap-1">
                      <Clock size={11} />
                      پایان: {format(timings.effectiveEnd, 'yyyy/MM/dd HH:mm')}
                      {timings.source !== 'explicit-end-date' && (
                        <span className="text-gray-400 mr-1">(پیش‌فرض)</span>
                      )}
                    </div>
                    {a.status === AssignmentStatus.Active && computed === 'ExpiredButNotClosed' && (
                      <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/60 rounded px-1.5 py-0.5 border border-amber-200">
                        نیاز به بسته شدن دارد
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Stethoscope size={14} className="text-teal-600" />
                      <span>{a.caregiverName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-500" />
                      <span>{a.patientName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1 font-medium text-gray-800 dark:text-gray-200">
                        <CalendarDays size={12} className="text-gray-400" />
                        {getShiftSlotLabel(a.shiftSlot)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        وضعیت دیتابیس: {originalStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded border text-xs font-bold ${pres.badgeClass}`}>
                      {pres.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 text-xs ${pres.accentClass} font-medium`}>
                        <Timer size={12} />
                        {getAssignmentRemainingText(a, nowTick)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {onCloseShift && (computed === 'Active' || computed === 'ExpiredButNotClosed' || computed === 'Upcoming') && (
                        <button
                          onClick={() => onCloseShift(a)}
                          className={`p-1.5 rounded transition-colors ${
                            computed === 'ExpiredButNotClosed'
                              ? 'text-rose-600 hover:bg-rose-50 bg-rose-50/50 border border-rose-200 shadow-sm'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={computed === 'ExpiredButNotClosed' ? 'بستن شیفت منقضی‌شده' : 'بستن و علامت‌گذاری پایان شیفت'}
                        >
                          <LogOut size={15} />
                        </button>
                      )}
                      {onReopenShift && (computed === 'Completed' || computed === 'Cancelled' || computed === 'Suspended') && (
                        <button
                          onClick={() => onReopenShift(a)}
                          disabled={reopenIsLoading}
                          className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="باز کردن مجدد شیفت (به وضعیت فعال)"
                        >
                          <Undo2 size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(a)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="ویرایش تخصیص"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => onViewHistory(a)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="تاریخچه تغییرات"
                      >
                        <History size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700">
          <span className="text-sm text-gray-500">
            صفحه {data.pageNumber} از {data.totalPages}
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!data.hasPreviousPage}
            >
              <ChevronRight size={16} />
              قبلی
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={!data.hasNextPage}
            >
              بعدی
              <ChevronLeft size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

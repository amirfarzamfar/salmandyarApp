"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { assignmentService } from "@/services/assignment.service";
import { AssignmentDto, AssignmentStatus, ShiftSlot } from "@/types/assignment";
import { format } from "date-fns-jalali";
import { Stethoscope, User, Clock, CalendarDays, History, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ShiftListViewProps {
  search?: string;
  patientId?: string;
  caregiverId?: string;
  status?: AssignmentStatus;
  start?: string;
  end?: string;
  onEdit: (assignment: AssignmentDto) => void;
  onViewHistory: (assignment: AssignmentDto) => void;
}

export function ShiftListView({ search, patientId, caregiverId, status, start, end, onEdit, onViewHistory }: ShiftListViewProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  const getStatusLabel = (s: AssignmentStatus) => {
    switch(s) {
      case AssignmentStatus.Active: return <span className="px-2 py-1 rounded bg-teal-100 text-teal-800 text-xs">فعال</span>;
      case AssignmentStatus.Completed: return <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs">پایان‌یافته</span>;
      case AssignmentStatus.Cancelled: return <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs">لغو شده</span>;
      default: return <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs">نامشخص</span>;
    }
  }

  if (isLoading) return <div className="py-10 text-center text-gray-500">در حال بارگذاری...</div>;

  const items = data?.items || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">تاریخ و زمان</th>
              <th className="px-4 py-3">پرستار / سالمندیار</th>
              <th className="px-4 py-3">بیمار</th>
              <th className="px-4 py-3">شیفت</th>
              <th className="px-4 py-3">وضعیت</th>
              <th className="px-4 py-3 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">موردی یافت نشد.</td>
              </tr>
            ) : items.map((a) => (
              <tr key={a.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  {format(new Date(a.startDate), 'yyyy/MM/dd HH:mm')}
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
                  {getShiftSlotLabel(a.shiftSlot)}
                </td>
                <td className="px-4 py-3">
                  {getStatusLabel(a.status)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onEdit(a)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="ویرایش"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => onViewHistory(a)}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="تاریخچه تغییرات"
                    >
                      <History size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { assignmentService } from "@/services/assignment.service";
import { CaregiverSchedule } from "@/components/admin/assignments/caregiver-schedule";
import { AssignmentWizard } from "@/components/admin/assignments/assignment-wizard";
import { ShiftListView } from "@/components/admin/assignments/shift-list-view";
import { ShiftAuditModal } from "@/components/admin/assignments/shift-audit-modal";
import { Button } from "@/components/ui/Button";
import { Plus, Filter, Clock, Calendar, List } from "lucide-react";
import { startOfMonth, endOfMonth } from "date-fns";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { formatTehranDateValue } from "@/lib/tehran-date";

import { AssignmentDto, AssignmentStatus } from "@/types/assignment";

export default function ShiftManagementPage() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentDto | null>(null);
  
  const [auditAssignment, setAuditAssignment] = useState<AssignmentDto | null>(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filters
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterPatientId, setFilterPatientId] = useState<string>("");
  const [filterCaregiverId, setFilterCaregiverId] = useState<string>("");
  const [filterSearch, setFilterSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<AssignmentStatus | "">("");
  const [dateRange, setDateRange] = useState<Date[]>([]);

  const handleEdit = (assignment: AssignmentDto) => {
    setEditingAssignment(assignment);
    setIsWizardOpen(true);
  };

  const handleViewHistory = (assignment: AssignmentDto) => {
    setAuditAssignment(assignment);
    setIsAuditOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
    setEditingAssignment(null);
  };

  const startDateFilter = dateRange.length > 0 && dateRange[0] ? formatTehranDateValue(dateRange[0]) : undefined;
  const endDateFilter = dateRange.length > 1 && dateRange[1] ? formatTehranDateValue(dateRange[1]) : startDateFilter;

  const { data: calendarAssignments, isLoading: isLoadingCalendar, refetch: refetchCalendar } = useQuery({
    queryKey: ['assignments-calendar', currentDate, filterPatientId, filterCaregiverId, filterStatus],
    queryFn: () => assignmentService.getCalendar(
      startOfMonth(currentDate).toISOString(),
      endOfMonth(currentDate).toISOString(),
      filterPatientId ? parseInt(filterPatientId) : undefined,
      filterCaregiverId || undefined,
      filterStatus ? parseInt(filterStatus.toString()) : undefined
    ),
    enabled: viewMode === "calendar"
  });

  return (
    <div className="space-y-6 bg-gray-50/50 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-teal-600" />
            مدیریت شیفت و تخصیص
          </h1>
          <p className="text-sm text-gray-500 mt-1">برنامه‌ریزی، پیگیری و مدیریت زمان‌بندی پرستاران و بیماران در کل سیستم</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex items-center">
            <button 
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "list" ? "bg-white dark:bg-gray-700 shadow-sm text-teal-700 dark:text-teal-400" : "text-gray-500 hover:text-gray-700"}`}
            >
              <List size={16} />
              لیست شیفت‌ها
            </button>
            <button 
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "calendar" ? "bg-white dark:bg-gray-700 shadow-sm text-teal-700 dark:text-teal-400" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Calendar size={16} />
              تقویم (هفتگی)
            </button>
          </div>

          <Button 
            variant={isFilterOpen ? "secondary" : "outline"}
            onClick={() => setIsFilterOpen(!isFilterOpen)} 
            className="gap-2 bg-white dark:bg-gray-800 sm:w-auto"
          >
            <Filter size={16} />
            فیلترها
          </Button>
          <Button 
            onClick={() => {
              setEditingAssignment(null);
              setIsWizardOpen(true);
            }} 
            className="gap-2 bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 sm:w-auto"
          >
            <Plus size={16} />
            تخصیص جدید
          </Button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm animate-in slide-in-from-top-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">جستجوی کلی</label>
            <input 
              type="text" 
              placeholder="نام بیمار، پرستار..." 
              className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-700"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
            />
          </div>
          {viewMode === "list" ? (
            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-medium text-gray-500">بازه زمانی</label>
              <DatePicker
                range
                calendar={persian}
                locale={persian_fa}
                value={dateRange}
                onChange={(dateObjects: any) => {
                  if (Array.isArray(dateObjects)) {
                    setDateRange(dateObjects.map(d => d?.toDate?.() || null).filter(Boolean));
                  } else if (dateObjects) {
                    setDateRange([dateObjects.toDate()]);
                  } else {
                    setDateRange([]);
                  }
                }}
                containerClassName="w-full"
                inputClass="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-700 h-[38px]"
                placeholder="انتخاب بازه تاریخ..."
              />
            </div>
          ) : (
            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-medium text-gray-500">هفته مورد نظر (برای تقویم)</label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={currentDate}
                onChange={(dateObject: any) => {
                  if (dateObject) {
                    setCurrentDate(dateObject.toDate());
                  }
                }}
                containerClassName="w-full"
                inputClass="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-700 h-[38px]"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">وضعیت</label>
            <select 
              className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-700 h-[38px]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">همه وضعیت‌ها</option>
              <option value={AssignmentStatus.Active}>فعال</option>
              <option value={AssignmentStatus.Completed}>پایان‌یافته</option>
              <option value={AssignmentStatus.Cancelled}>لغو شده</option>
            </select>
          </div>
          <div className="flex items-end justify-end">
             <Button variant="ghost" size="sm" onClick={() => { 
               setFilterPatientId(""); 
               setFilterCaregiverId(""); 
               setFilterSearch("");
               setFilterStatus("");
               setDateRange([]);
               setCurrentDate(new Date());
             }} className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full lg:w-auto h-[38px]">
               پاک کردن
             </Button>
          </div>
        </div>
      )}

      {viewMode === "list" ? (
        <ShiftListView 
          search={filterSearch}
          patientId={filterPatientId}
          caregiverId={filterCaregiverId}
          status={filterStatus !== "" ? filterStatus as AssignmentStatus : undefined}
          start={startDateFilter}
          end={endDateFilter}
          onEdit={handleEdit}
          onViewHistory={handleViewHistory}
        />
      ) : (
        isLoadingCalendar ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <CaregiverSchedule 
            assignments={calendarAssignments || []} 
            onEdit={handleEdit}
            currentDate={currentDate}
          />
        )
      )}

      <AssignmentWizard 
        isOpen={isWizardOpen} 
        onClose={handleCloseWizard}
        onSuccess={() => {
          // If we use query client we could invalidate both queries
          refetchCalendar();
        }}
        initialData={editingAssignment}
      />

      <ShiftAuditModal 
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        assignment={auditAssignment}
      />
    </div>
  );
}

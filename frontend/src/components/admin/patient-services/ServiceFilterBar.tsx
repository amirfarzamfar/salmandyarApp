"use client";

import { Search, X, FilterX } from "lucide-react";
import { useState } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import type {
  PatientServiceQueryFilters,
  CareServiceStatus,
  ServiceAssignmentStatus,
} from "@/types/patient-service";
import {
  CareServiceStatus as CareServiceStatusEnum,
  ServiceAssignmentStatus as ServiceAssignmentStatusEnum,
} from "@/types/patient-service";
import { formatTehranDateValue } from "@/lib/tehran-date";
import { cn } from "@/lib/utils";

interface ServiceFilterBarProps {
  filters: PatientServiceQueryFilters;
  onChange: (next: PatientServiceQueryFilters) => void;
}

const statusOptions: { value: CareServiceStatus | ""; label: string }[] = [
  { value: "", label: "همه وضعیت‌ها" },
  { value: CareServiceStatusEnum.Draft, label: "پیش‌نویس" },
  { value: CareServiceStatusEnum.Scheduled, label: "برنامه‌ریزی شده" },
  { value: CareServiceStatusEnum.Pending, label: "در انتظار" },
  { value: CareServiceStatusEnum.Assigned, label: "تخصیص‌یافته" },
  { value: CareServiceStatusEnum.Accepted, label: "پذیرفته شده" },
  { value: CareServiceStatusEnum.InProgress, label: "در حال انجام" },
  { value: CareServiceStatusEnum.Completed, label: "تکمیل شده" },
  { value: CareServiceStatusEnum.Cancelled, label: "لغو شده" },
  { value: CareServiceStatusEnum.NoShow, label: "غیبت بدون اطلاع" },
  { value: CareServiceStatusEnum.Expired, label: "منقضی شده" },
];

const assignmentStatusOptions: {
  value: ServiceAssignmentStatus | "";
  label: string;
}[] = [
  { value: "", label: "همه" },
  { value: ServiceAssignmentStatusEnum.Unassigned, label: "بدون تخصیص" },
  { value: ServiceAssignmentStatusEnum.Assigned, label: "تخصیص‌یافته" },
  { value: ServiceAssignmentStatusEnum.Accepted, label: "پذیرفته شده" },
  { value: ServiceAssignmentStatusEnum.Declined, label: "رد شده" },
  { value: ServiceAssignmentStatusEnum.Reassigned, label: "تخصیص مجدد" },
];

function hasAnyFilter(f: PatientServiceQueryFilters): boolean {
  return Boolean(
    f.searchQuery ||
      f.serviceDefinitionId ||
      f.status != null ||
      f.assignmentStatus != null ||
      f.performerId ||
      f.fromDate ||
      f.toDate
  );
}

export function ServiceFilterBar({ filters, onChange }: ServiceFilterBarProps) {
  const [dateRange, setDateRange] = useState<Date[]>([]);

  const baseInputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-teal-900/40";

  const clearAll = () => {
    setDateRange([]);
    onChange({
      pageNumber: 1,
      pageSize: filters.pageSize,
    });
  };

  const update = (patch: Partial<PatientServiceQueryFilters>) => {
    onChange({ ...filters, ...patch, pageNumber: 1 });
  };

  const anyFilter = hasAnyFilter(filters);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="space-y-1.5 lg:col-span-2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            جستجو
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              dir="rtl"
              placeholder="نام بیمار، نوع خدمت، خدمت‌دهنده..."
              value={filters.searchQuery ?? ""}
              onChange={(e) => update({ searchQuery: e.target.value })}
              className={cn(baseInputClass, "pr-10 pl-9")}
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => update({ searchQuery: null })}
                className="absolute left-2 top-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            نوع خدمت
          </label>
          <select
            value={filters.serviceDefinitionId ?? ""}
            onChange={(e) =>
              update({
                serviceDefinitionId: e.target.value
                  ? Number(e.target.value)
                  : null,
              })
            }
            className={baseInputClass}
            disabled
          >
            <option value="">(در دست پیاده‌سازی)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            وضعیت خدمت
          </label>
          <select
            value={filters.status ?? ""}
            onChange={(e) =>
              update({
                status: e.target.value === "" ? null : (Number(e.target.value) as CareServiceStatus),
              })
            }
            className={baseInputClass}
          >
            {statusOptions.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            وضعیت تخصیص
          </label>
          <select
            value={filters.assignmentStatus ?? ""}
            onChange={(e) =>
              update({
                assignmentStatus:
                  e.target.value === ""
                    ? null
                    : (Number(e.target.value) as ServiceAssignmentStatus),
              })
            }
            className={baseInputClass}
          >
            {assignmentStatusOptions.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            پرستار / خدمت‌دهنده
          </label>
          <select disabled className={baseInputClass}>
            <option value="">(در دست پیاده‌سازی)</option>
          </select>
        </div>

        <div className="space-y-1.5 lg:col-span-3">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            بازه تاریخ
          </label>
          <DatePicker
            range
            calendar={persian}
            locale={persian_fa}
            value={dateRange}
            onChange={(dateObjects: any) => {
              const list: Date[] = Array.isArray(dateObjects)
                ? dateObjects
                    .map((d) => d?.toDate?.())
                    .filter(Boolean)
                : dateObjects
                ? [dateObjects.toDate()]
                : [];
              setDateRange(list);
              update({
                fromDate: list[0] ? formatTehranDateValue(list[0]) : null,
                toDate: list[1]
                  ? formatTehranDateValue(list[1])
                  : list[0]
                  ? formatTehranDateValue(list[0])
                  : null,
              });
            }}
            containerClassName="w-full"
            inputClass={cn(
              baseInputClass,
              "!h-[38px] !py-1 !bg-white dark:!bg-slate-900"
            )}
            placeholder="انتخاب بازه تاریخ..."
          />
        </div>

        <div className="flex items-end justify-start lg:col-span-3 lg:justify-end">
          <button
            type="button"
            onClick={clearAll}
            disabled={!anyFilter}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
              anyFilter
                ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800/50 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50"
                : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
            )}
          >
            <FilterX className="h-4 w-4" />
            پاک کردن فیلترها
          </button>
        </div>
      </div>
    </div>
  );
}

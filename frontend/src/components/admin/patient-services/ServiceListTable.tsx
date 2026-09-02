"use client";

import {
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Inbox,
  UserRound,
  Bell,
  BellOff,
} from "lucide-react";
import type {
  PatientServiceListItemDto,
  PagedResponse,
} from "@/types/patient-service";
import {
  CareServiceStatus,
  ServiceAssignmentStatus,
} from "@/types/patient-service";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ServiceListTableProps {
  data?: PagedResponse<PatientServiceListItemDto>;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  selectedIds: number[];
  onToggleSelection: (id: number) => void;
  onToggleAll: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
  onOpenDetail: (service: PatientServiceListItemDto) => void;
  onOpenEdit?: (service: PatientServiceListItemDto) => void;
}

function formatFaDate(value?: string | null) {
  if (!value) return "-";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    const fa = d.toLocaleDateString("fa-IR");
    if (!fa) return "-";
    if (fa.startsWith("-") || fa.includes("−") || /^[−-]?\d{2,3}\//.test(fa)) {
      return "-";
    }
    return fa;
  } catch {
    return "-";
  }
}

function formatFaDateTime(value?: string | null) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "-";
  }
}

function formatTimeOnly(value?: string | null) {
  if (!value) return "-";
  try {
    if (value.includes(":") && value.length <= 12) {
      const clean = value.split(".")[0];
      const [h, m] = clean.split(":");
      if (h && m) {
        const hh = String(parseInt(h, 10)).padStart(2, "0");
        const mm = String(parseInt(m, 10)).padStart(2, "0");
        return `${hh}:${mm}`;
      }
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

function getStatusBadge(status: CareServiceStatus) {
  switch (status) {
    case CareServiceStatus.Draft:
      return { label: "پیش‌نویس", cls: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200" };
    case CareServiceStatus.Scheduled:
      return { label: "برنامه‌ریزی شده", cls: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" };
    case CareServiceStatus.Pending:
      return { label: "در انتظار", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" };
    case CareServiceStatus.Assigned:
      return { label: "تخصیص‌یافته", cls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" };
    case CareServiceStatus.Accepted:
      return { label: "پذیرفته شده", cls: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300" };
    case CareServiceStatus.InProgress:
      return { label: "در حال انجام", cls: "bg-teal-500/15 text-teal-700 dark:text-teal-400 ring-1 ring-inset ring-teal-500/30" };
    case CareServiceStatus.Completed:
      return { label: "تکمیل شده", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" };
    case CareServiceStatus.Cancelled:
      return { label: "لغو شده", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" };
    case CareServiceStatus.NoShow:
      return { label: "غیبت", cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" };
    case CareServiceStatus.Expired:
      return { label: "منقضی", cls: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300" };
    default:
      return { label: "نامشخص", cls: "bg-slate-100 text-slate-600" };
  }
}

function getAssignmentBadge(status: ServiceAssignmentStatus) {
  switch (status) {
    case ServiceAssignmentStatus.Unassigned:
      return { label: "بدون تخصیص", cls: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:ring-orange-800/50" };
    case ServiceAssignmentStatus.Assigned:
      return { label: "تخصیص یافته", cls: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:ring-indigo-800/50" };
    case ServiceAssignmentStatus.Accepted:
      return { label: "پذیرفته شده", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-800/50" };
    case ServiceAssignmentStatus.Declined:
      return { label: "رد شده", cls: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:ring-rose-800/50" };
    case ServiceAssignmentStatus.Reassigned:
      return { label: "تخصیص مجدد", cls: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:ring-violet-800/50" };
    default:
      return { label: "نامشخص", cls: "bg-slate-100 text-slate-600" };
  }
}

function Avatar({
  name,
  avatar,
}: {
  name: string;
  avatar?: string | null;
}) {
  const initial = name?.trim()?.charAt(0) || "?";
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 object-cover dark:border-slate-700"
      />
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-black text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
      {initial}
    </div>
  );
}

function SkeletonRows({ count = 8 }: { count?: number }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-4">
        <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700" />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-2.5 w-20 rounded bg-slate-200/70 dark:bg-slate-700/70" />
          </div>
        </div>
      </td>
      {Array.from({ length: 9 }).map((__, j) => (
        <td key={j} className="px-4 py-4">
          <div className="h-3.5 w-20 rounded bg-slate-200 dark:bg-slate-700" />
        </td>
      ))}
    </tr>
  ));
}

export function ServiceListTable({
  data,
  isLoading,
  isError,
  error,
  selectedIds,
  onToggleSelection,
  onToggleAll,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onOpenDetail,
  onOpenEdit,
}: ServiceListTableProps) {
  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const pageNumber = data?.pageNumber ?? 1;
  const pageSize = data?.pageSize ?? 10;
  const totalPages = data?.totalPages ?? 1;
  const from = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const to = Math.min(pageNumber * pageSize, totalCount);

  const allSelected =
    items.length > 0 && items.every((it) => selectedIds.includes(it.id));
  const someSelected = items.some((it) => selectedIds.includes(it.id));

  const thCls =
    "whitespace-nowrap border-b border-slate-200 bg-slate-50 px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300";

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-10 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-rose-800 dark:text-rose-200">
          خطا در دریافت لیست خدمات
        </h3>
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-300/80">
          {(error as any)?.response?.data?.error ??
            (error as any)?.message ??
            "لطفاً اتصال شبکه را بررسی کنید و دوباره تلاش کنید."}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-rose-700"
        >
          <RefreshCw className="h-4 w-4" />
          تلاش مجدد
        </button>
      </div>
    );
  }

  const isEmpty = !isLoading && items.length === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/40">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-right text-sm">
          <thead>
            <tr>
              <th className={cn(thCls, "w-12")}>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !allSelected && someSelected;
                  }}
                  onChange={onToggleAll}
                  disabled={isLoading || items.length === 0}
                />
              </th>
              <th className={thCls}>بیمار</th>
              <th className={thCls}>نوع خدمت</th>
              <th className={thCls}>تاریخ</th>
              <th className={thCls}>ساعت</th>
              <th className={thCls}>وضعیت</th>
              <th className={thCls}>خدمت‌دهنده</th>
              <th className={thCls}>وضعیت تخصیص</th>
              <th className={thCls}>اعلان</th>
              <th className={thCls}>ایجادکننده</th>
              <th className={thCls}>آخرین تغییر</th>
              <th className={cn(thCls, "w-32 text-left")}>عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {isLoading ? (
              <SkeletonRows />
            ) : isEmpty ? (
              <tr>
                <td colSpan={12} className="px-4 py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-400">
                      <Inbox className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">
                      خدمتی یافت نشد
                    </h3>
                    <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                      با توجه به فیلترهای انتخاب‌شده، هیچ خدمتی برای نمایش وجود ندارد. می‌توانید فیلترها را تغییر دهید یا خدمت جدیدی ثبت کنید.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((svc) => {
                const isSelected = selectedIds.includes(svc.id);
                const statusBadge = getStatusBadge(svc.status);
                const assBadge = getAssignmentBadge(svc.assignmentStatus);
                return (
                  <tr
                    key={svc.id}
                    className={cn(
                      "transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30",
                      isSelected && "bg-teal-50/40 dark:bg-teal-900/20"
                    )}
                  >
                    <td className="px-4 py-4 align-middle">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        checked={isSelected}
                        onChange={() => onToggleSelection(svc.id)}
                      />
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar name={svc.patientFullName} avatar={svc.patientAvatar} />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900 dark:text-slate-100">
                            {svc.patientFullName}
                          </div>
                          <div className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                            شناسه #{svc.careRecipientId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {svc.serviceTitle}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-middle text-slate-700 dark:text-slate-300">
                      {formatFaDate(svc.scheduledDate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-middle text-slate-700 dark:text-slate-300">
                      {svc.scheduledStartTime ? formatTimeOnly(svc.scheduledStartTime) : "-"}
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <Badge
                        className={cn("border-0 font-medium", statusBadge.cls)}
                        variant="outline"
                      >
                        {statusBadge.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      {svc.performerFullName ? (
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300">
                            {svc.performerFullName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          تخصیص نیافته
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <Badge
                        className={cn("border-0 font-medium", assBadge.cls)}
                        variant="outline"
                      >
                        {assBadge.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      {svc.hasNotification ? (
                        <div className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-800/50">
                          <Bell className="h-3.5 w-3.5" />
                          فعال
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                          <BellOff className="h-3.5 w-3.5" />
                          غیرفعال
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-middle text-slate-600 dark:text-slate-300">
                      <div className="text-xs">{svc.createdByName}</div>
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        {formatFaDateTime(svc.createdAt)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-middle text-xs text-slate-500 dark:text-slate-400">
                      {formatFaDateTime(svc.updatedAt ?? svc.createdAt)}
                    </td>
                    <td className="px-4 py-4 align-middle text-left">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenDetail(svc)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-700 dark:hover:bg-teal-950/40 dark:hover:text-teal-300"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          جزئیات
                        </button>
                        {onOpenEdit && (
                          <button
                            type="button"
                            onClick={() => onOpenEdit(svc)}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition hover:border-amber-400 hover:bg-amber-100 hover:text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/40"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            ویرایش
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isEmpty && !isLoading && (
        <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center dark:border-slate-700/60">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            نمایش <span className="font-semibold text-slate-700 dark:text-slate-200">{from.toLocaleString("fa-IR")}</span>{" "}
            تا <span className="font-semibold text-slate-700 dark:text-slate-200">{to.toLocaleString("fa-IR")}</span>{" "}
            از مجموع <span className="font-semibold text-slate-700 dark:text-slate-200">{totalCount.toLocaleString("fa-IR")}</span>{" "}
            خدمت
          </div>
          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span>تعداد در صفحه:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n.toLocaleString("fa-IR")}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(pageNumber - 1)}
                disabled={pageNumber <= 1}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:disabled:hover:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="min-w-[90px] text-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                صفحه {pageNumber.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}
              </div>
              <button
                type="button"
                onClick={() => onPageChange(pageNumber + 1)}
                disabled={pageNumber >= totalPages}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:disabled:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

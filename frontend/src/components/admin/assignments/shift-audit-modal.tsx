"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { assignmentService } from "@/services/assignment.service";
import { userService } from "@/services/user.service";
import { AssignmentDto } from "@/types/assignment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns-jalali";
import { Loader2, ArrowLeftRight, Minus, Plus } from "lucide-react";

interface ShiftAuditModalProps {
  assignment: AssignmentDto | null;
  isOpen: boolean;
  onClose: () => void;
}

const ASSIGNMENT_FIELD_LABELS: Record<string, string> = {
  PatientId: "شناسه بیمار",
  CaregiverId: "شناسه پرستار",
  AssignmentType: "نوع تخصیص",
  ShiftSlot: "نوع شیفت",
  StartDate: "تاریخ شروع",
  EndDate: "تاریخ پایان",
  IsPrimaryCaregiver: "پرستار اصلی",
  Notes: "یادداشت‌ها / توضیحات",
  Status: "وضعیت",
  OldStatus: "وضعیت قبلی",
  NewStatus: "وضعیت جدید",
  OldValue: "مقادیر قبلی",
  NewValue: "مقادیر جدید",
  closingMeta: "اطلاعات بسته شدن شیفت",
  closedAt: "زمان بستن",
  closeType: "نوع بستن",
  reason: "دلیل",
  timing: "وضعیت زمان‌بندی",
};

const ROLE_LABELS: Record<string, string> = {
  Admin: "مدیر سامانه",
  SuperAdmin: "سوپرادمین",
  SystemAdmin: "مدیر سیستم",
  Caregiver: "پرستار",
  Patient: "بیمار",
  PatientFamily: "خاونده بیمار",
  Doctor: "پزشک",
  Nurse: "پرستار",
  Guest: "مهمان",
  User: "کاربر",
};

const translateAssignmentStatus = (s: any) => {
  if (typeof s === "string" && /^\d+$/.test(s)) s = Number(s);
  const v = typeof s === "number" ? s : (s as any);
  switch (v) {
    case 0:
    case "Active":
      return { label: "فعال", cls: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200" };
    case 1:
    case "Completed":
      return { label: "پایان‌یافته", cls: "text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200" };
    case 2:
    case "Cancelled":
      return { label: "لغو شده", cls: "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200" };
    case 3:
    case "Suspended":
      return { label: "تعلیق شده", cls: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200" };
    default:
      return { label: s === null || s === undefined ? "—" : String(s), cls: "text-gray-700 dark:text-gray-300" };
  }
};

const translateShiftSlot = (s: any) => {
  if (typeof s === "string" && /^\d+$/.test(s)) s = Number(s);
  switch (s) {
    case 0: return "—";
    case 1: return "صبح";
    case 2: return "عصر";
    case 3: return "شب";
    case 4: return "لانگ (۱۶ ساعت)";
    case 5: return "۲۴ ساعته";
    default: return s === null || s === undefined ? "—" : String(s);
  }
};

const translateAssignmentType = (s: any) => {
  if (typeof s === "string" && /^\d+$/.test(s)) s = Number(s);
  switch (s) {
    case 0: return "روزانه";
    case 1: return "ماهانه";
    case 2: return "شیفتی";
    case 3: return "۲۴ ساعته";
    default: return s === null || s === undefined ? "—" : String(s);
  }
};

const prettyDate = (v: any) => {
  if (!v) return "—";
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return format(d, "yyyy/MM/dd HH:mm:ss");
  } catch {
    return String(v);
  }
};

const prettyBool = (v: any) => {
  if (v === null || v === undefined) return "—";
  return v ? <span className="text-emerald-700 dark:text-emerald-400 font-bold">بله</span> : <span className="text-gray-500">خیر</span>;
};

const normalizeKey = (k: string) => {
  const lowerFirst = k.slice(0, 1).toLowerCase() + k.slice(1);
  return lowerFirst;
};

const formatAssignmentField = (key: string, v: any): React.ReactNode => {
  const nkey = normalizeKey(key);
  if (v === null || v === undefined || v === "") return <span className="text-gray-400 italic">—</span>;

  if (key === "Status" || key === "status") {
    const t = translateAssignmentStatus(v);
    return <span className={`inline-flex rounded border px-2 py-0.5 text-xs font-bold ${t.cls}`}>{t.label}</span>;
  }
  if (key === "ShiftSlot" || key === "shiftSlot") return translateShiftSlot(v);
  if (key === "AssignmentType" || key === "assignmentType") return translateAssignmentType(v);
  if (key === "IsPrimaryCaregiver" || key === "isPrimaryCaregiver") return prettyBool(v);

  if (
    key === "StartDate" || key === "startDate" ||
    key === "EndDate" || key === "endDate" ||
    key === "closedAt" || key === "ClosedAt" ||
    nkey.toLowerCase().includes("date") ||
    nkey.toLowerCase().includes("at")
  ) {
    return prettyDate(v);
  }

  if (key === "Notes" || key === "notes") return renderNotesBox(String(v));

  if (typeof v === "object") {
    return (
      <pre className="whitespace-pre-wrap font-sans text-[11px] bg-white dark:bg-gray-900 p-2 rounded border overflow-x-auto">
        {JSON.stringify(v, null, 2)}
      </pre>
    );
  }

  return <span dir="auto">{String(v)}</span>;
};

function renderNotesBox(text: string) {
  if (!text || text.trim() === "") return <span className="text-gray-400 italic">بدون یادداشت</span>;
  const lines = text.split(/\r?\n/);
  return (
    <div dir="rtl" className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl p-3.5 space-y-1 text-[12.5px] leading-8 shadow-inner">
      {lines.map((ln, i) => {
        const t = ln.trim();
        if (t.startsWith("===")) {
          return (
            <div key={i} className="font-black text-teal-700 dark:text-teal-400 border-t border-b border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/30 rounded-lg py-1.5 px-2 my-1.5 first:mt-0">
              {t}
            </div>
          );
        }
        if (/^(زمان (بستن|باز شدن)|نوع بستن|وضعیت زمان‌بندی|دلیل|نتیجه نهایی وضعیت|از وضعیت|به)\s*:/.test(t) || t.includes("→ وضعیت:")) {
          return <div key={i} className="text-sky-700 dark:text-sky-300 font-semibold">{ln}</div>;
        }
        if (t.length === 0) return <div key={i} className="h-1.5" />;
        return <div key={i}>{ln}</div>;
      })}
    </div>
  );
}

function tryParseJsonString(v: any): any {
  if (typeof v !== "string") return v;
  const t = v.trim();
  if (!t) return v;
  if ((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"))) {
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }
  return v;
}

function valuesDeeplyEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return String(a) === String(b);
  if (a === null || b === null) return a === b;
  if (typeof a === "object" && typeof b === "object") {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return false;
}

export function ShiftAuditModal({ assignment, isOpen, onClose }: ShiftAuditModalProps) {
  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["shift-audit", assignment?.id],
    queryFn: () => (assignment ? assignmentService.getAuditLogs(assignment.id) : Promise.resolve<any[]>([])),
    enabled: !!assignment && isOpen,
  });

  const { data: usersPage } = useQuery({
    queryKey: ["all-users-for-audit-names"],
    queryFn: () =>
      userService.getUsers({
        pageNumber: 1,
        pageSize: 500,
      }),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });

  const userById = useMemo(() => {
    const map = new Map<string, { fullName: string; role: string }>();
    (usersPage?.items ?? []).forEach((u) => {
      const role = u.roles?.[0] ?? u.role ?? "User";
      map.set(u.id, {
        fullName: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || u.phoneNumber || "نامشخص",
        role,
      });
    });
    return map;
  }, [usersPage]);

  const translateAction = (action: string) => {
    switch (action) {
      case "Create":
        return "ایجاد شیفت";
      case "Update":
        return "ویرایش اطلاعات شیفت";
      case "UpdateStatus":
        return "تغییر وضعیت شیفت";
      case "Delete":
        return "حذف شیفت";
      default:
        return action;
    }
  };

  const actionBadgeClass = (action: string) => {
    switch (action) {
      case "Create":
        return "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/70";
      case "Update":
        return "text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60 border-sky-200 dark:border-sky-900/70";
      case "UpdateStatus":
        return "text-violet-700 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/60 border-violet-200 dark:border-violet-900/70";
      case "Delete":
        return "text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/70";
      default:
        return "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-gray-200";
    }
  };

  const renderUserBadge = (uid: string | undefined) => {
    if (!uid || uid === "system" || uid === "System") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 text-[11px] font-bold border border-gray-200 dark:border-gray-700">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
          حساب سیستم
        </span>
      );
    }
    const info = userById.get(uid);
    if (info) {
      return (
        <span className="inline-flex flex-wrap items-center gap-1 rounded-full bg-gradient-to-r from-slate-100 to-teal-50 dark:from-slate-800 dark:to-teal-950/50 text-slate-700 dark:text-slate-200 px-2.5 py-0.5 text-[11.5px] font-bold border border-teal-100 dark:border-teal-900/60 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-teal-500 ring-2 ring-teal-200 dark:ring-teal-900" />
          <span>{info.fullName}</span>
          <span className="text-[9.5px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/70 rounded px-1.5 py-0.5 border border-teal-200 dark:border-teal-900/50">
            {ROLE_LABELS[info.role] ?? info.role}
          </span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 text-[10.5px] font-mono border border-gray-200 dark:border-gray-700" dir="ltr">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
        {uid.slice(0, 8)}…
      </span>
    );
  };

  const renderUpdateStatusDetails = (parsed: any) => {
    const oldT = translateAssignmentStatus(parsed.OldStatus ?? parsed.oldStatus);
    const newT = translateAssignmentStatus(parsed.NewStatus ?? parsed.newStatus);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 bg-gradient-to-r from-rose-50 via-white to-emerald-50 dark:from-rose-950/40 dark:via-gray-900 dark:to-emerald-950/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="space-y-1.5">
            <div className="text-[10.5px] font-black uppercase tracking-[0.15em] text-rose-500 dark:text-rose-400 flex items-center gap-1">
              <Minus size={11} /> قبلی
            </div>
            <span className={`inline-flex items-center rounded-xl border px-3 py-1 text-xs font-black shadow-sm ${oldT.cls}`}>{oldT.label}</span>
          </div>
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900/50 dark:to-violet-800/50 p-1.5 border border-violet-200 dark:border-violet-800">
              <ArrowLeftRight className="text-violet-600 dark:text-violet-300" size={16} />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="text-[10.5px] font-black uppercase tracking-[0.15em] text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
              <Plus size={11} /> جدید
            </div>
            <span className={`inline-flex items-center rounded-xl border px-3 py-1 text-xs font-black shadow-sm ${newT.cls}`}>{newT.label}</span>
          </div>
        </div>
        {Object.entries(parsed).some(([k]) => k !== "OldStatus" && k !== "oldStatus" && k !== "NewStatus" && k !== "newStatus") && (
          <div className="space-y-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
            {Object.entries(parsed)
              .filter(([k]) => k !== "OldStatus" && k !== "oldStatus" && k !== "NewStatus" && k !== "newStatus")
              .map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <div className="text-[10.5px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {ASSIGNMENT_FIELD_LABELS[k] ?? normalizeKey(k)}
                  </div>
                  <div className="text-sm">{formatAssignmentField(k, tryParseJsonString(v))}</div>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  };

  const renderUpdateDetails = (parsed: any) => {
    const oldRaw = tryParseJsonString(parsed.OldValue ?? parsed.oldValue);
    const newRaw = tryParseJsonString(parsed.NewValue ?? parsed.newValue);

    const oldObj = oldRaw && typeof oldRaw === "object" && !Array.isArray(oldRaw) ? (oldRaw as Record<string, any>) : null;
    const newObj = newRaw && typeof newRaw === "object" && !Array.isArray(newRaw) ? (newRaw as Record<string, any>) : null;

    if (!oldObj || !newObj) {
      return (
        <div className="space-y-2">
          {Object.entries(parsed).map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5 border-b border-gray-100 dark:border-gray-700/60 pb-2 last:border-b-0 last:pb-0">
              <div className="text-[10.5px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {ASSIGNMENT_FIELD_LABELS[k] ?? normalizeKey(k)}
              </div>
              <div className="text-sm">{formatAssignmentField(k, tryParseJsonString(v))}</div>
            </div>
          ))}
        </div>
      );
    }

    const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));
    const changedKeys = allKeys.filter((k) => !valuesDeeplyEqual(oldObj[k], newObj[k]));
    const unchangedKeys = allKeys.filter((k) => valuesDeeplyEqual(oldObj[k], newObj[k]));

    return (
      <div className="space-y-4">
        {changedKeys.length > 0 && (
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wider mb-2.5 border border-amber-200 dark:border-amber-900/60">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              فیلدهای تغییر یافته ({changedKeys.length})
            </div>
            <div className="space-y-2.5">
              {changedKeys.map((k) => (
                <div key={k} className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900/60">
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-900 px-3.5 py-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="text-[11px] font-black tracking-wide text-gray-700 dark:text-gray-300">
                      {ASSIGNMENT_FIELD_LABELS[k] ?? normalizeKey(k)}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3">
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-black uppercase tracking-[0.15em] text-rose-500 dark:text-rose-400 flex items-center gap-1">
                        <Minus size={10} /> مقدار قبلی
                      </div>
                      <div className="rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 p-2.5 text-sm text-gray-800 dark:text-gray-200">
                        {formatAssignmentField(k, oldObj[k])}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                        <Plus size={10} /> مقدار جدید
                      </div>
                      <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 p-2.5 text-sm text-gray-800 dark:text-gray-200">
                        {formatAssignmentField(k, newObj[k])}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {unchangedKeys.length > 0 && (
          <details className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 overflow-hidden">
            <summary className="cursor-pointer list-none px-4 py-2.5 flex items-center justify-between select-none hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 inline-flex items-center gap-1.5">
                فیلدهای بدون تغییر ({unchangedKeys.length})
              </span>
              <span className="text-gray-400 text-xs transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="px-4 pb-3 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              {unchangedKeys.map((k) => (
                <div key={k} className="flex items-start justify-between gap-2 border-b border-dashed border-gray-200 dark:border-gray-800 pb-1.5 last:border-b-0">
                  <span className="text-[10.5px] font-bold text-gray-500 dark:text-gray-400 shrink-0 pt-1.5">
                    {ASSIGNMENT_FIELD_LABELS[k] ?? normalizeKey(k)}:
                  </span>
                  <span className="text-[12px] text-gray-700 dark:text-gray-300 text-right truncate max-w-[60%]">
                    {formatAssignmentField(k, newObj[k])}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    );
  };

  const renderCreateDetails = (parsed: any) => {
    const isObj = parsed && typeof parsed === "object" && !Array.isArray(parsed);
    if (!isObj) {
      return (
        <pre className="whitespace-pre-wrap font-sans text-xs bg-white dark:bg-gray-900 p-2 rounded border overflow-x-auto">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    }
    const entries = Object.entries(parsed as Record<string, any>);
    return (
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/50 p-3">
        <div className="space-y-2">
          {entries.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5 border-b border-emerald-100/80 dark:border-emerald-900/50 pb-1.5 last:border-b-0 last:pb-0">
              <div className="text-[10.5px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {ASSIGNMENT_FIELD_LABELS[k] ?? normalizeKey(k)}
              </div>
              <div className="text-sm text-gray-800 dark:text-gray-200">{formatAssignmentField(k, tryParseJsonString(v))}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDetails = (detailsRaw: string | undefined, action: string) => {
    if (!detailsRaw) return <p className="text-xs text-gray-400 italic">بدون جزئیات ثبت شده</p>;

    let parsed: any;
    try {
      parsed = JSON.parse(detailsRaw);
    } catch {
      return (
        <pre className="whitespace-pre-wrap font-sans text-xs bg-white dark:bg-gray-900 p-3 rounded-xl border overflow-x-auto">
          {detailsRaw}
        </pre>
      );
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return (
        <pre className="whitespace-pre-wrap font-sans text-xs bg-white dark:bg-gray-900 p-3 rounded-xl border overflow-x-auto">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    }

    if (action === "UpdateStatus" || parsed.OldStatus !== undefined || parsed.NewStatus !== undefined) {
      return renderUpdateStatusDetails(parsed);
    }

    if (action === "Update" && (parsed.OldValue !== undefined || parsed.NewValue !== undefined || parsed.oldValue !== undefined || parsed.newValue !== undefined)) {
      return renderUpdateDetails(parsed);
    }

    if (action === "Create") {
      return renderCreateDetails(parsed);
    }

    const entries = Object.entries(parsed);
    return (
      <div className="space-y-2">
        {entries.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 border-b border-gray-100 dark:border-gray-700/60 pb-2 last:border-b-0 last:pb-0">
            <div className="text-[10.5px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {ASSIGNMENT_FIELD_LABELS[k] ?? normalizeKey(k)}
            </div>
            <div className="text-sm">{formatAssignmentField(k, tryParseJsonString(v))}</div>
          </div>
        ))}
      </div>
    );
  };

  const isLoading = logsLoading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <DialogTitle className="text-lg">تاریخچه تغییرات شیفت</DialogTitle>
          <DialogDescription className="text-sm">
            {assignment ? (
              <span>
                شیفت <span className="font-bold text-teal-700 dark:text-teal-400">{assignment.caregiverName}</span> برای بیمار{" "}
                <span className="font-bold text-sky-700 dark:text-sky-400">{assignment.patientName}</span>
              </span>
            ) : (
              "جزئیات ثبت شده از تمامی تغییرات انجام شده روی این شیفت"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1 my-4">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-16 gap-3 text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
              <div className="text-sm font-medium">در حال بارگذاری تاریخچه تغییرات و اطلاعات کاربران...</div>
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="relative pl-6 space-y-5">
              <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-teal-200 via-violet-200 to-sky-200 dark:from-teal-900 dark:via-violet-900 dark:to-sky-900 rounded-full" />
              {logs.map((log: any, idx: number) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[22px] top-5 h-3 w-3 rounded-full bg-white dark:bg-gray-800 border-2 border-teal-500 dark:border-teal-400 shadow-md ring-4 ring-teal-100 dark:ring-teal-950" />
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="flex flex-wrap justify-between items-start gap-2 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-900 px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/60">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11.5px] font-black border shadow-sm ${actionBadgeClass(log.action)}`}>
                          {translateAction(log.action)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10.5px] font-bold text-gray-500 dark:text-gray-400">توسط:</span>
                          {renderUserBadge(log.userId)}
                        </div>
                      </div>
                      <div className="text-[11.5px] text-gray-500 dark:text-gray-400 font-bold bg-white dark:bg-gray-900 rounded-lg px-2.5 py-1 border border-gray-200 dark:border-gray-700" dir="ltr">
                        {format(new Date(log.createdAt), "yyyy/MM/dd HH:mm:ss")}
                      </div>
                    </div>
                    <div className="p-4 text-sm text-gray-700 dark:text-gray-300">{renderDetails(log.details, log.action)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center py-16 gap-3 text-gray-500 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="text-sm font-bold">تاریخچه‌ای برای این شیفت ثبت نشده است</div>
              <div className="text-xs">لیست تغییرات شیفت (ایجاد، ویرایش، تغییر وضعیت) اینجا نمایش داده خواهد شد.</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

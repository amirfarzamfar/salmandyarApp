"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssignmentDto, AssignmentStatus, ShiftSlot } from "@/types/assignment";
import { assignmentService } from "@/services/assignment.service";
import { toast } from "react-hot-toast";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Clock7,
  FileText,
  Loader2,
  LogOut,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns-jalali";
import {
  computeAssignmentStatus,
  getAssignmentTimings,
  getAssignmentRemainingText,
  getAssignmentStatusPresentation,
  getShiftSlotLabelFromSlot,
} from "@/lib/assignment-status";

export type ShiftCloseType =
  | "NormalEnd"
  | "EarlyEnd_Agreed"
  | "EarlyEnd_Emergency"
  | "EarlyEnd_Substitution"
  | "Cancel_PatientRequest"
  | "Cancel_NoShowCaregiver"
  | "Suspend_UntilFurtherNotice";

export interface ShiftCloseOption {
  id: ShiftCloseType;
  targetStatus: AssignmentStatus;
  label: string;
  shortLabel: string;
  description: string;
  requireReason: boolean;
  severity: "success" | "warning" | "danger" | "info";
  icon: "check" | "alert" | "clock" | "exit";
}

export const SHIFT_CLOSE_OPTIONS: ShiftCloseOption[] = [
  {
    id: "NormalEnd",
    targetStatus: AssignmentStatus.Completed,
    label: "اتمام عادی شیفت (در موعد)",
    shortLabel: "پایان عادی",
    description: "پرستار طبق برنامه، تکالیف خود را در پایان شیفت تحویل داده است.",
    requireReason: false,
    severity: "success",
    icon: "check",
  },
  {
    id: "EarlyEnd_Agreed",
    targetStatus: AssignmentStatus.Completed,
    label: "ترخیص زودهنگام (با توافق طرفین)",
    shortLabel: "ترخیص زود با توافق",
    description: "با رضایت بیمار/مسئول و تکمیل شدن امور ضروری، پرستار زودتر آزاد می‌شود.",
    requireReason: true,
    severity: "warning",
    icon: "clock",
  },
  {
    id: "EarlyEnd_Emergency",
    targetStatus: AssignmentStatus.Completed,
    label: "خروج اضطراری پرستار",
    shortLabel: "خروج اضطراری",
    description: "پرستار به دلیل اضطرار شخصی/درمانی زودتر شیفت را ترک می‌کند.",
    requireReason: true,
    severity: "danger",
    icon: "alert",
  },
  {
    id: "EarlyEnd_Substitution",
    targetStatus: AssignmentStatus.Completed,
    label: "جایگزین شدن پرستار",
    shortLabel: "جایگزین شد",
    description: "پرستار با پرستار دیگری جایگزین شده و این شیفت بسته می‌شود (شیفت جدید جداگانه ثبت می‌گردد).",
    requireReason: true,
    severity: "info",
    icon: "exit",
  },
  {
    id: "Cancel_PatientRequest",
    targetStatus: AssignmentStatus.Cancelled,
    label: "لغو توسط بیمار/مسئول",
    shortLabel: "لغو توسط بیمار",
    description: "بیمار یا جانشین وی درخواست لغو شیفت را داشت.",
    requireReason: true,
    severity: "warning",
    icon: "exit",
  },
  {
    id: "Cancel_NoShowCaregiver",
    targetStatus: AssignmentStatus.Cancelled,
    label: "عدم حضور پرستار (No-Show)",
    shortLabel: "عدم حضور پرستار",
    description: "پرستار به موقع حضور نیافته و/یا تماسی دریافت نشده است.",
    requireReason: true,
    severity: "danger",
    icon: "alert",
  },
  {
    id: "Suspend_UntilFurtherNotice",
    targetStatus: AssignmentStatus.Suspended,
    label: "تعلیق موقت شیفت",
    shortLabel: "تعلیق موقت",
    description: "شیفت موقتاً متوقف می‌شود اما برای ادامه در آینده (از سر گرفته خواهد شد).",
    requireReason: true,
    severity: "info",
    icon: "clock",
  },
];

const closeSchema = z.object({
  closeType: z.string().min(1, "انتخاب نوع بستن الزامی است"),
  notes: z.string().optional(),
});

type CloseFormValues = z.infer<typeof closeSchema>;

export interface AssignmentCloseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: AssignmentDto | null;
  onSuccess?: () => void;
}

const getShiftSlotLabel = (slot?: ShiftSlot) => {
  return getShiftSlotLabelFromSlot(slot);
};

const SEVERITY_STYLES: Record<ShiftCloseOption["severity"], {
  row: string;
  badge: string;
  btn: string;
  btnHover: string;
  title: string;
  iconBg: string;
  iconColor: string;
}> = {
  success: {
    row: "border-emerald-200 bg-emerald-50 hover:bg-emerald-50/70 dark:border-emerald-800/50 dark:bg-emerald-900/20",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    btnHover: "hover:bg-emerald-100 text-emerald-700",
    title: "text-emerald-700 dark:text-emerald-300",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-300",
  },
  warning: {
    row: "border-amber-200 bg-amber-50 hover:bg-amber-50/70 dark:border-amber-800/50 dark:bg-amber-900/20",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    btn: "bg-amber-600 hover:bg-amber-700 text-white",
    btnHover: "hover:bg-amber-100 text-amber-700",
    title: "text-amber-700 dark:text-amber-300",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-300",
  },
  danger: {
    row: "border-rose-200 bg-rose-50 hover:bg-rose-50/70 dark:border-rose-800/50 dark:bg-rose-900/20",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    btn: "bg-rose-600 hover:bg-rose-700 text-white",
    btnHover: "hover:bg-rose-100 text-rose-700",
    title: "text-rose-700 dark:text-rose-300",
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
    iconColor: "text-rose-600 dark:text-rose-300",
  },
  info: {
    row: "border-sky-200 bg-sky-50 hover:bg-sky-50/70 dark:border-sky-800/50 dark:bg-sky-900/20",
    badge: "bg-sky-100 text-sky-700 border-sky-200",
    btn: "bg-sky-600 hover:bg-sky-700 text-white",
    btnHover: "hover:bg-sky-100 text-sky-700",
    title: "text-sky-700 dark:text-sky-300",
    iconBg: "bg-sky-100 dark:bg-sky-900/40",
    iconColor: "text-sky-600 dark:text-sky-300",
  },
};

const ICONS: Record<ShiftCloseOption["icon"], React.ComponentType<{ size?: number; className?: string }>> = {
  check: CheckCircle2,
  alert: AlertTriangle,
  clock: Clock7,
  exit: LogOut,
};

export function AssignmentCloseDialog({ isOpen, onClose, assignment, onSuccess }: AssignmentCloseDialogProps) {
  const queryClient = useQueryClient();
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    if (!isOpen) return;
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 15 * 1000);
    return () => window.clearInterval(id);
  }, [isOpen]);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<CloseFormValues>({
    resolver: zodResolver(closeSchema),
    defaultValues: { closeType: "", notes: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ closeType: "", notes: "" });
    }
  }, [isOpen, reset]);

  const timings = useMemo(() => {
    if (!assignment) return null;
    return getAssignmentTimings(assignment);
  }, [assignment]);

  const timingState = useMemo(() => {
    if (!assignment || !timings) return null;
    const startMs = timings.start.getTime();
    const endMs = timings.effectiveEnd.getTime();
    const nowMs = now.getTime();

    const diffMin = Math.round((endMs - nowMs) / 60000);
    if (Math.abs(diffMin) <= 15) {
      return { state: "on-time", diffMin: 0, label: "در زمان موعد (± ۱۵ دقیقه)", color: "emerald" };
    }
    if (nowMs < endMs) {
      const h = Math.floor(Math.abs(diffMin) / 60);
      const m = Math.abs(diffMin) % 60;
      return {
        state: "early",
        diffMin,
        label: `${h > 0 ? `${h} ساعت و ` : ""}${m} دقیقه زودتر از زمان پایان`,
        color: "amber",
      };
    }
    const h = Math.floor(Math.abs(diffMin) / 60);
    const m = Math.abs(diffMin) % 60;
    return {
      state: "late",
      diffMin,
      label: `${h > 0 ? `${h} ساعت و ` : ""}${m} دقیقه پس از زمان پایان`,
      color: "rose",
    };
  }, [assignment, timings, now]);

  const selectedCloseType = useMemo(() => {
    const v = watch("closeType");
    return SHIFT_CLOSE_OPTIONS.find(o => o.id === v);
  }, [watch]);

  const reasonRequired = useMemo(() => {
    if (!selectedCloseType) return false;
    if (selectedCloseType.requireReason) return true;
    // Even for NormalEnd, if admin is closing EARLY (before end - 15m buffer), we FORCE a reason
    if (timingState?.state === "early") return true;
    return false;
  }, [selectedCloseType, timingState]);

  const closeShiftMutation = useMutation({
    mutationFn: async ({ closeTypeId, notes }: { closeTypeId: ShiftCloseType; notes?: string }) => {
      if (!assignment) throw new Error("شیفت انتخابی یافت نشد");
      const opt = SHIFT_CLOSE_OPTIONS.find(o => o.id === closeTypeId);
      if (!opt) throw new Error("نوع بستن انتخابی معتبر نیست");

      const closeAuditLines: string[] = [];
      const when = now.toISOString();
      const whenFa = format(now, "yyyy/MM/dd HH:mm");
      closeAuditLines.push("=== بسته شدن شیفت توسط ادمین ===");
      closeAuditLines.push(`زمان بستن: ${whenFa}`);
      closeAuditLines.push(`نوع بستن: ${opt.label}`);
      if (timingState) {
        closeAuditLines.push(`وضعیت زمان‌بندی: ${timingState.label}`);
      }
      if (notes?.trim()) {
        closeAuditLines.push(`توضیحات/دلیل: ${notes.trim()}`);
      }
      closeAuditLines.push(`نتیجه نهایی وضعیت: ${
        opt.targetStatus === AssignmentStatus.Completed
          ? "Completed / پایان‌یافته"
          : opt.targetStatus === AssignmentStatus.Cancelled
            ? "Cancelled / لغو شده"
            : "Suspended / معلق"
      }`);
      const closingAuditText = "\n\n" + closeAuditLines.join("\n");

      const finalNotes = `${assignment.notes ?? ""}${closingAuditText}`;

      // 1. Update notes so that closing audit text is stored (use update endpoint — we need full payload — build it from existing data)
      try {
        await assignmentService.update(assignment.id, {
          patientId: assignment.patientId,
          caregiverId: assignment.caregiverId,
          assignmentType: assignment.assignmentType,
          shiftSlot: assignment.shiftSlot,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          isPrimaryCaregiver: assignment.isPrimaryCaregiver,
          notes: finalNotes,
        });
      } catch (e) {
        // Non-fatal: Log and proceed with status update anyway
        // eslint-disable-next-line no-console
        console.warn("Assignment note partial update failed, falling back to status-only change", e);
      }

      // 2. Update status (the actual close-shift change)
      await assignmentService.updateStatus(assignment.id, opt.targetStatus);

      // 3. Try to store closing metadata in body (backend might ignore unknown fields — forward-compatible)
      try {
        await (assignmentService as any).updateStatus?.(assignment.id, {
          status: opt.targetStatus,
          closingMeta: {
            closeType: closeTypeId,
            closedAt: when,
            reason: notes?.trim() ?? null,
            timing: timingState,
          },
        } as any);
      } catch {
        /* ignore — field may not be supported by backend */
      }

      return { targetStatus: opt.targetStatus, opt, timing: timingState, notes };
    },
    onSuccess: (data) => {
      toast.success(`شیفت با موفقیت بسته شد (${data.opt.shortLabel})`);
      void queryClient.invalidateQueries({ queryKey: ["assignments-paged"] });
      void queryClient.invalidateQueries({ queryKey: ["assignments-calendar"] });
      void queryClient.invalidateQueries({ queryKey: ["users-paged"] });
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "خطا در بستن شیفت");
    },
  });

  if (!isOpen || !assignment) return null;

  const computed = computeAssignmentStatus(assignment, now);
  const pres = getAssignmentStatusPresentation(computed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gray-100 bg-white/90 px-5 py-4 backdrop-blur dark:border-gray-700 dark:bg-gray-800/90 sm:px-6">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${pres.accentSoftClass.includes('bg-') ? '' : ''} shrink-0 bg-gradient-to-br ${
              timingState?.color === 'emerald'
                ? 'from-emerald-500 to-teal-600'
                : timingState?.color === 'amber'
                  ? 'from-amber-500 to-orange-600'
                  : timingState?.color === 'rose'
                    ? 'from-rose-500 to-red-600'
                    : 'from-indigo-500 to-violet-600'
            } text-white shadow-sm`}>
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 sm:text-xl">بستن و علامت‌گذاری شیفت</h2>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">نوع بستن را مشخص کنید؛ در صورت نیاز دلیل بسته شدن نیز ثبت خواهد شد.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors shrink-0">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit(async (v) => {
            const closeTypeId = v.closeType as ShiftCloseType;
            if (!SHIFT_CLOSE_OPTIONS.find(o => o.id === closeTypeId)?.requireReason === false) {
              // Allow empty notes if normal end but NOT early
            }
            if (reasonRequired && !v.notes?.trim()) {
              toast.error("برای این نوع بستن، ثبت توضیحات/دلیل الزامی است");
              return;
            }
            await closeShiftMutation.mutateAsync({ closeTypeId, notes: v.notes });
          })}
          className="space-y-5 p-5 sm:p-6"
        >
          {/* Shift Info Summary */}
          <section className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40 sm:p-5">
            <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                  <User size={16} className="text-teal-700 dark:text-teal-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">بیمار</div>
                  <div className="font-bold text-gray-900 dark:text-gray-100 truncate">{assignment.patientName}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-900/40 flex items-center justify-center shrink-0">
                  <Stethoscope size={16} className="text-sky-700 dark:text-sky-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">پرستار</div>
                  <div className="font-bold text-gray-900 dark:text-gray-100 truncate">{assignment.caregiverName}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                  <Clock3 size={16} className="text-indigo-700 dark:text-indigo-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">شیفت {getShiftSlotLabel(assignment.shiftSlot)} — بازه زمانی</div>
                  <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                    {timings && format(timings.start, "yyyy/MM/dd HH:mm")} تا {timings && format(timings.effectiveEnd, "yyyy/MM/dd HH:mm")}
                  </div>
                  {timings?.source !== 'explicit-end-date' && (
                    <div className="text-[10px] text-gray-400 mt-0.5">مدت پیش‌فرض بر اساس نوع شیفت</div>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  timingState?.color === 'emerald'
                    ? 'bg-emerald-50 dark:bg-emerald-900/40'
                    : timingState?.color === 'amber'
                      ? 'bg-amber-50 dark:bg-amber-900/40'
                      : 'bg-rose-50 dark:bg-rose-900/40'
                }`}>
                  {timingState?.color === 'emerald' ? (
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-300" />
                  ) : timingState?.color === 'amber' ? (
                    <AlertTriangle size={16} className="text-amber-600 dark:text-amber-300" />
                  ) : (
                    <Clock7 size={16} className="text-rose-600 dark:text-rose-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    زمان فعلی نسبت به پایان شیفت</div>
                  <div className={`font-black text-sm ${
                    timingState?.color === 'emerald'
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : timingState?.color === 'amber'
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-rose-700 dark:text-rose-300'
                  }`}>
                    {timingState?.label}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock3 size={10} /> {getAssignmentRemainingText(assignment, now)}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Close Type Radio List */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">نوع بستن شیفت را انتخاب کنید</h3>
              <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
                selectedCloseType ? SEVERITY_STYLES[selectedCloseType.severity].badge : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                {selectedCloseType ? selectedCloseType.shortLabel : 'انتخاب نشده'}
              </span>
            </div>
            <div className="grid gap-2">
              {SHIFT_CLOSE_OPTIONS.map((opt) => {
                const Icon = ICONS[opt.icon];
                const isSelected = watch("closeType") === opt.id;
                const sev = SEVERITY_STYLES[opt.severity];
                const forceReason = opt.requireReason || (timingState?.state === "early" && opt.id === "NormalEnd");
                return (
                  <label
                    key={opt.id}
                    className={`cursor-pointer border rounded-2xl p-3.5 sm:p-4 transition-all flex items-start gap-3 sm:gap-4 ${
                      isSelected
                        ? `${sev.row} ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-800 ${
                            opt.severity === "success" ? "ring-emerald-400" :
                            opt.severity === "warning" ? "ring-amber-400" :
                            opt.severity === "danger" ? "ring-rose-400" :
                            "ring-sky-400"
                          }`
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => setValue("closeType", opt.id, { shouldValidate: true })}
                      className="mt-0.5 sm:mt-1 w-4 h-4 accent-teal-600 shrink-0"
                    />
                    <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                      <Icon size={18} className={sev.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`font-black text-sm ${sev.title}`}>{opt.label}</span>
                        {forceReason && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold rounded-md px-1.5 py-0.5 border border-amber-200 bg-amber-50 text-amber-700">
                            <AlertTriangle size={10} /> نیاز به دلیل
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[12px] leading-relaxed text-gray-600 dark:text-gray-400">
                        {opt.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.closeType && (
              <p className="mt-2 text-xs font-bold text-rose-500 flex items-center gap-1">
                <AlertTriangle size={12} /> {errors.closeType.message}
              </p>
            )}
          </section>

          {/* Notes / Reason */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText size={16} className="text-gray-500" />
                توضیحات / دلیل بسته شدن
                {reasonRequired && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">الزامی</span>
                )}
                {!reasonRequired && selectedCloseType && (
                  <span className="text-[11px] text-gray-400">اختیاری</span>
                )}
              </label>
            </div>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder={
                reasonRequired
                  ? "دلیل دقیق و وضعیت تکمیل امور، تحویل به پرستار بعدی و هر نکته مهم بالینی را بنویسید..."
                  : "یادداشت تکمیلی مانند تحویل امور، وضعیت بیمار، یا نکات بعدی را در صورت نیاز بنویسید..."
              }
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-700 p-3.5 text-sm outline-none focus:ring-2 focus:ring-teal-400 transition resize-y min-h-[96px]"
            />
            {reasonRequired && (
              <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                <span>
                  {selectedCloseType?.id === "NormalEnd"
                    ? "شما در حال بستن شیفت قبل از زمان پایان هستید — دلیل زودتر آزاد شدن پرستار را حتماً ثبت کنید (در پرونده بیمار و تاریخچه تغییرات این توضیحات ثبت می‌شود)."
                    : "دلیل را به‌طور مختصر بنویسید — این متن به صورت «یادداشت بسته شدن» در یادداشت‌های شیفت ذخیره می‌گردد و در تاریخچه تغییرات قابل مشاهده خواهد بود."}
                </span>
              </p>
            )}
          </section>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={closeShiftMutation.isPending}
              className="w-full sm:w-auto"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={closeShiftMutation.isPending}
              className={`w-full sm:w-auto gap-2 shadow-lg ${
                selectedCloseType
                  ? SEVERITY_STYLES[selectedCloseType.severity].btn
                  : "bg-gray-600 hover:bg-gray-700 text-white hover:shadow-gray-600/20"
              }`}
            >
              {closeShiftMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                  <CheckCircle2 size={16} />
                )}
              {closeShiftMutation.isPending ? "در حال بستن شیفت..." : "بستن و ثبت شیفت"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

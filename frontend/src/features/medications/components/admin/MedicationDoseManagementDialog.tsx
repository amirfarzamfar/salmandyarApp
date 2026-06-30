"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, History, Pencil, RotateCcw, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MedicationAdministrationOutcome, MedicationAdministrationReportRow, MedicationTimingStatus } from "@/types/medication";
import { useCorrectDose, useDoseHistory, useResetDoseLog, useReviewDose } from "@/features/medications/hooks/useKardex";
import { getMedicationDoseStatusPresentation, getShiftSlotLabel } from "@/features/medications/lib/administration-ui";
import { toast } from "react-hot-toast";

type Mode = "review" | "correct";

export function MedicationDoseManagementDialog({
  open,
  onOpenChange,
  row,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  row: MedicationAdministrationReportRow | null;
}) {
  const doseId = row?.doseId ?? null;
  const { data: historyItems, isLoading: isLoadingHistory } = useDoseHistory(doseId);
  const { mutateAsync: reviewDose, isPending: isReviewing } = useReviewDose();
  const { mutateAsync: correctDose, isPending: isCorrecting } = useCorrectDose();
  const { mutateAsync: resetDoseLog, isPending: isResetting } = useResetDoseLog();

  const [mode, setMode] = useState<Mode>("review");
  const [reviewApprove, setReviewApprove] = useState(true);
  const [reviewReason, setReviewReason] = useState("");
  const [reviewClinicalNotes, setReviewClinicalNotes] = useState("");

  const [correctOutcome, setCorrectOutcome] = useState<MedicationAdministrationOutcome>(MedicationAdministrationOutcome.Taken);
  const [correctActualAt, setCorrectActualAt] = useState("");
  const [correctCorrectionReason, setCorrectCorrectionReason] = useState("");
  const [correctMissedReason, setCorrectMissedReason] = useState("");
  const [correctPatientComment, setCorrectPatientComment] = useState("");
  const [correctNotes, setCorrectNotes] = useState("");
  const [correctClinicalNotes, setCorrectClinicalNotes] = useState("");

  const statusPresentation = useMemo(() => {
    if (!row) {
      return null;
    }

    return getMedicationDoseStatusPresentation({
      id: row.doseId,
      scheduledTime: row.scheduledTime,
      actualAdministrationAt: row.actualAdministrationAt,
      status: row.status,
      administrationOutcome: row.administrationOutcome,
      timingStatus: row.timingStatus,
      verificationStatus: row.verificationStatus,
      scheduledShiftSlot: row.scheduledShiftSlot,
      delayMinutes: row.delayMinutes,
      medicationName: row.medicationName,
      dosage: "",
      instructions: "",
      route: "",
      administrationWindowMinutesSnapshot: 0,
      currentQuantity: 0,
      alertLimit: 0,
      doseQuantity: 0,
      stockStatus: 0,
      stockStatusLabel: "",
      isLowStockAlertActive: false,
      patientName: row.patientName,
      careRecipientId: row.careRecipientId,
    } as any);
  }, [row]);

  useEffect(() => {
    if (!open) {
      setMode("review");
      setReviewApprove(true);
      setReviewReason("");
      setReviewClinicalNotes("");
      setCorrectOutcome(MedicationAdministrationOutcome.Taken);
      setCorrectActualAt("");
      setCorrectCorrectionReason("");
      setCorrectMissedReason("");
      setCorrectPatientComment("");
      setCorrectNotes("");
      setCorrectClinicalNotes("");
    }
  }, [open]);

  if (!row || !statusPresentation) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full max-w-2xl sm:rounded-3xl">
          <div className="py-10 text-center text-slate-500">اطلاعات نوبت یافت نشد.</div>
        </DialogContent>
      </Dialog>
    );
  }

  const canReview = row.verificationStatus === 0 || row.verificationStatus === 3;

  const isLateOrMissed = row.timingStatus === MedicationTimingStatus.Late || row.administrationOutcome === MedicationAdministrationOutcome.Missed;

  const isBusy = isReviewing || isCorrecting || isResetting;

  const submitReview = async () => {
    if (!doseId) return;

    try {
      await reviewDose({
        doseId,
        approve: reviewApprove,
        reason: reviewReason.trim() || undefined,
        clinicalNotes: reviewClinicalNotes.trim() || undefined,
      });
      toast.success("بررسی نوبت ذخیره شد.");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "ثبت بررسی انجام نشد.");
    }
  };

  const submitCorrection = async () => {
    if (!doseId) return;

    const correctionReason = correctCorrectionReason.trim();
    if (!correctionReason) {
      toast.error("دلیل اصلاح اجباری است.");
      return;
    }

    try {
      await correctDose({
        doseId,
        outcome: correctOutcome,
        actualAdministrationAt: correctActualAt ? new Date(correctActualAt).toISOString() : undefined,
        correctionReason,
        missedReason: correctMissedReason.trim() || undefined,
        patientComment: correctPatientComment.trim() || undefined,
        notes: correctNotes.trim() || undefined,
        clinicalNotes: correctClinicalNotes.trim() || undefined,
      });
      toast.success("اصلاح نوبت انجام شد.");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "اصلاح نوبت انجام نشد.");
    }
  };

  const submitReset = async () => {
    if (!doseId) return;

    try {
      await resetDoseLog(doseId);
      toast.success("ثبت نوبت بازنشانی شد.");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "بازنشانی انجام نشد.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 sm:rounded-3xl">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-slate-100 p-6 lg:border-b-0 lg:border-l lg:border-slate-100">
            <DialogHeader className="text-right">
              <DialogTitle className="flex flex-wrap items-center gap-2 text-xl font-extrabold text-slate-900">
                مدیریت مصرف دارو
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusPresentation.className}`}>
                  {statusPresentation.label}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="mt-5 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex flex-col gap-2 text-sm text-slate-700">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{row.patientName}</span>
                    <span className="text-xs text-slate-500">#{row.careRecipientId}</span>
                  </div>
                  <div className="font-bold text-slate-900">{row.medicationName}</div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span>زمان: {new Date(row.scheduledTime).toLocaleString("fa-IR")}</span>
                    <span>شیفت: {getShiftSlotLabel(row.scheduledShiftSlot)}</span>
                    {typeof row.delayMinutes === "number" ? <span>تاخیر: {row.delayMinutes} دقیقه</span> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span>ثبت‌کننده: {row.recordedByName || "-"}</span>
                    <span>تأییدکننده: {row.verifiedByName || "-"}</span>
                  </div>
                  {row.notes ? <div className="mt-2 text-xs text-slate-600">یادداشت: {row.notes}</div> : null}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setMode("review")}
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold transition ${mode === "review" ? "bg-teal-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                >
                  <ClipboardCheck className="ml-2 inline h-4 w-4" />
                  بررسی (تأیید/رد)
                </button>
                <button
                  type="button"
                  onClick={() => setMode("correct")}
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold transition ${mode === "correct" ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                >
                  <Pencil className="ml-2 inline h-4 w-4" />
                  اصلاح مدیریتی
                </button>
              </div>

              {mode === "review" ? (
                <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <ClipboardCheck className="h-4 w-4 text-teal-600" />
                      بررسی ثبت
                    </div>
                    {!canReview ? (
                      <div className="text-xs font-medium text-slate-500">این نوبت در وضعیت قابل بررسی نیست.</div>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={!canReview || isBusy}
                      onClick={() => setReviewApprove(true)}
                      className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${reviewApprove ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"} disabled:opacity-60`}
                    >
                      <CheckCircle2 className="ml-2 inline h-4 w-4" />
                      تأیید
                    </button>
                    <button
                      type="button"
                      disabled={!canReview || isBusy}
                      onClick={() => setReviewApprove(false)}
                      className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${!reviewApprove ? "bg-rose-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"} disabled:opacity-60`}
                    >
                      <XCircle className="ml-2 inline h-4 w-4" />
                      رد
                    </button>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">دلیل / توضیح</label>
                      <input
                        value={reviewReason}
                        onChange={(e) => setReviewReason(e.target.value)}
                        disabled={!canReview || isBusy}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 disabled:bg-slate-50"
                        placeholder="مثلاً: نیاز به تماس با پرستار"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">یادداشت بالینی</label>
                      <input
                        value={reviewClinicalNotes}
                        onChange={(e) => setReviewClinicalNotes(e.target.value)}
                        disabled={!canReview || isBusy}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 disabled:bg-slate-50"
                        placeholder="اختیاری"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={submitReview}
                    disabled={!canReview || isBusy}
                    className="w-full rounded-2xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-60"
                  >
                    ذخیره بررسی
                  </button>
                </div>
              ) : (
                <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Pencil className="h-4 w-4 text-indigo-600" />
                    اصلاح مدیریتی
                    {isLateOrMissed ? (
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                        Late/Missed
                      </span>
                    ) : null}
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Outcome</label>
                      <select
                        value={correctOutcome}
                        onChange={(e) => setCorrectOutcome(Number(e.target.value) as MedicationAdministrationOutcome)}
                        disabled={isBusy}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 disabled:bg-slate-50"
                      >
                        <option value={MedicationAdministrationOutcome.Taken}>مصرف شده</option>
                        <option value={MedicationAdministrationOutcome.Missed}>فراموش شده</option>
                        <option value={MedicationAdministrationOutcome.SkippedByPatient}>مصرف نکردم</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">زمان واقعی (اختیاری)</label>
                      <input
                        type="datetime-local"
                        value={correctActualAt}
                        onChange={(e) => setCorrectActualAt(e.target.value)}
                        disabled={isBusy}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">دلیل اصلاح (اجباری)</label>
                    <input
                      value={correctCorrectionReason}
                      onChange={(e) => setCorrectCorrectionReason(e.target.value)}
                      disabled={isBusy}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 disabled:bg-slate-50"
                      placeholder="مثلاً: ثبت اشتباه توسط بیمار"
                    />
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">علت عدم مصرف</label>
                      <input
                        value={correctMissedReason}
                        onChange={(e) => setCorrectMissedReason(e.target.value)}
                        disabled={isBusy}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 disabled:bg-slate-50"
                        placeholder="اختیاری"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">توضیح بیمار</label>
                      <input
                        value={correctPatientComment}
                        onChange={(e) => setCorrectPatientComment(e.target.value)}
                        disabled={isBusy}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 disabled:bg-slate-50"
                        placeholder="اختیاری"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">یادداشت مدیریتی</label>
                      <input
                        value={correctNotes}
                        onChange={(e) => setCorrectNotes(e.target.value)}
                        disabled={isBusy}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 disabled:bg-slate-50"
                        placeholder="اختیاری"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">یادداشت بالینی</label>
                      <input
                        value={correctClinicalNotes}
                        onChange={(e) => setCorrectClinicalNotes(e.target.value)}
                        disabled={isBusy}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 disabled:bg-slate-50"
                        placeholder="اختیاری"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={submitCorrection}
                    disabled={isBusy}
                    className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    ثبت اصلاح
                  </button>
                </div>
              )}

              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-600" />
                  <div className="space-y-2">
                    <div className="text-sm font-bold text-rose-900">بازنشانی وضعیت</div>
                    <div className="text-xs text-rose-700">این عمل ثبت مصرف را حذف می‌کند و نوبت را به حالت اولیه برمی‌گرداند.</div>
                    <button
                      type="button"
                      onClick={submitReset}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                    >
                      <RotateCcw className="h-4 w-4" />
                      بازنشانی
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <History className="h-4 w-4 text-slate-600" />
              تاریخچه تغییرات
            </div>

            <div className="mt-4 space-y-3">
              {isLoadingHistory ? (
                <div className="py-8 text-center text-slate-500">در حال دریافت تاریخچه...</div>
              ) : historyItems?.length ? (
                <div className="space-y-3">
                  {historyItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                        <span>{new Date(item.changedAtUtc).toLocaleString("fa-IR")}</span>
                        <span>{item.changedByName || "-"}</span>
                      </div>
                      <div className="mt-2 text-sm font-bold text-slate-900">{item.action}</div>
                      {(item.reason || item.notes) ? (
                        <div className="mt-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                          {item.reason ? <div>دلیل: {item.reason}</div> : null}
                          {item.notes ? <div>یادداشت: {item.notes}</div> : null}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-sm text-slate-500">
                  تاریخچه‌ای برای این نوبت ثبت نشده است.
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronLeft, Clock3, Pill, ShieldCheck, X } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  useRecordDoseByNurse,
  useReviewDose,
  useShiftMedicationBoard,
} from "@/features/medications/hooks/useKardex";
import {
  MedicationAdministrationOutcome,
  MedicationDose,
  ShiftSlot,
} from "@/types/medication";
import {
  getMedicationDoseStatusPresentation,
  getShiftSlotLabel,
  isDosePendingReview,
} from "@/features/medications/lib/administration-ui";

export function ShiftMedicationBoard() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [pendingOnly, setPendingOnly] = useState(true);
  const [shiftSlot, setShiftSlot] = useState<ShiftSlot | undefined>(undefined);

  const { data: doses, isLoading } = useShiftMedicationBoard(selectedDate, { shiftSlot, pendingOnly });
  const { mutateAsync: recordDose } = useRecordDoseByNurse();
  const { mutateAsync: reviewDose } = useReviewDose();

  const handleRecord = async (dose: MedicationDose, outcome: MedicationAdministrationOutcome) => {
    const clinicalNotes =
      outcome === MedicationAdministrationOutcome.Missed
        ? window.prompt("علت یا یادداشت بالینی برای مصرف‌نشده را وارد کنید:") ?? undefined
        : window.prompt("در صورت نیاز یادداشت بالینی را وارد کنید:") ?? undefined;

    try {
      await recordDose({
        doseId: dose.id,
        outcome,
        actualAdministrationAt: outcome === MedicationAdministrationOutcome.Taken ? new Date().toISOString() : undefined,
        clinicalNotes,
        notes: clinicalNotes,
        missedReason: outcome === MedicationAdministrationOutcome.Missed ? clinicalNotes : undefined,
      });
      toast.success("ثبت نوبت دارو انجام شد");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "ثبت وضعیت انجام نشد.");
    }
  };

  const handleReview = async (dose: MedicationDose, approve: boolean) => {
    const reason = approve ? undefined : window.prompt("دلیل رد ثبت بیمار را وارد کنید:");
    if (!approve && !reason?.trim()) {
      return;
    }

    try {
      await reviewDose({
        doseId: dose.id,
        approve,
        reason: reason ?? undefined,
      });
      toast.success(approve ? "ثبت بیمار تأیید شد" : "ثبت بیمار رد شد");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "عملیات بازبینی انجام نشد.");
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[2rem] bg-white p-5 shadow-soft-sm border border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-gray-900">برد دارویی شیفت</h3>
            <p className="mt-1 text-sm text-gray-500">ثبت، تأیید و پیگیری نوبت‌های دارویی بیماران تحت شیفت شما.</p>
          </div>
          <div className="rounded-2xl bg-medical-50 px-4 py-2 text-sm font-bold text-medical-700">
            {doses?.length ?? 0} نوبت
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-medical-400"
          />
          <select
            value={shiftSlot ?? ""}
            onChange={(event) => setShiftSlot(event.target.value ? Number(event.target.value) as ShiftSlot : undefined)}
            className="rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-medical-400"
          >
            <option value="">همه شیفت‌ها</option>
            <option value={ShiftSlot.Morning}>صبح</option>
            <option value={ShiftSlot.Evening}>عصر</option>
            <option value={ShiftSlot.Night}>شب</option>
          </select>
          <button
            type="button"
            onClick={() => setPendingOnly((value) => !value)}
            className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${pendingOnly ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}
          >
            {pendingOnly ? "فقط موارد نیازمند اقدام" : "نمایش همه نوبت‌ها"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-[2rem] bg-white p-10 text-center text-gray-500 shadow-soft-sm">در حال بارگذاری برد دارویی...</div>
      ) : !doses?.length ? (
        <div className="rounded-[2rem] border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500 shadow-soft-sm">
          نوبت فعالی برای این بازه یافت نشد.
        </div>
      ) : (
        <div className="grid gap-4">
          {doses.map((dose) => {
            const presentation = getMedicationDoseStatusPresentation(dose);
            const pendingReview = isDosePendingReview(dose);

            return (
              <div key={dose.id} className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-soft-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="rounded-2xl bg-medical-50 p-3 text-medical-600">
                        <Pill className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-black text-gray-900">{dose.medicationName}</div>
                        <div className="text-sm text-gray-500">{dose.patientName} - {dose.dosage}</div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${presentation.className}`}>
                        {presentation.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Clock3 className="h-4 w-4" /> {new Date(dose.scheduledTime).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>شیفت: {getShiftSlotLabel(dose.scheduledShiftSlot)}</span>
                      {dose.delayMinutes ? <span>تاخیر: {dose.delayMinutes} دقیقه</span> : null}
                    </div>
                    {(dose.patientComment || dose.notes || dose.clinicalNotes) && (
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        {dose.patientComment || dose.clinicalNotes || dose.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {pendingReview ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleReview(dose, true)}
                          className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          تأیید بیمار
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleReview(dose, false)}
                          className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 border border-rose-200"
                        >
                          <X className="h-4 w-4" />
                          رد ثبت
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleRecord(dose, MedicationAdministrationOutcome.Taken)}
                          className="flex items-center gap-2 rounded-2xl bg-medical-600 px-4 py-3 text-sm font-bold text-white"
                        >
                          <Check className="h-4 w-4" />
                          ثبت مصرف
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRecord(dose, MedicationAdministrationOutcome.Missed)}
                          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
                        >
                          مصرف‌نشده
                        </button>
                      </>
                    )}
                    <Link
                      href={`/nurse-portal/patient/${dose.careRecipientId}`}
                      className="flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700"
                    >
                      پرونده بیمار
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

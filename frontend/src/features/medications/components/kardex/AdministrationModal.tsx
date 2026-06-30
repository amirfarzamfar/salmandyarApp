import { useEffect, useMemo, useState } from "react";
import { Check, ClipboardCheck, History, RefreshCcw, ShieldAlert, X } from "lucide-react";
import { MedicationAdministrationOutcome, MedicationDose } from "@/types/medication";
import { useDoseHistory } from "../../hooks/useKardex";
import { getMedicationDoseStatusPresentation, isDosePendingReview } from "../../lib/administration-ui";

const FallbackDialog = ({ open, children }: { open: boolean; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 animate-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
};

const FallbackButton = ({ children, className, onClick, variant = 'primary', ...props }: any) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2";
  const variants: any = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg",
    destructive: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-md",
    outline: "border border-gray-300 hover:bg-gray-50 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-600"
  };
  return <button className={`${base} ${variants[variant]} ${className}`} onClick={onClick} {...props}>{children}</button>;
};

interface AdministrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'staff' | 'admin';
  dose: MedicationDose | null;
  onRecord: (payload: {
    outcome: MedicationAdministrationOutcome;
    actualAdministrationAt?: string;
    notes?: string;
    clinicalNotes?: string;
    missedReason?: string;
  }) => Promise<void> | void;
  onReview: (approve: boolean, reason?: string, clinicalNotes?: string) => Promise<void> | void;
  onCorrect?: (payload: {
    outcome: MedicationAdministrationOutcome;
    actualAdministrationAt?: string;
    correctionReason: string;
    notes?: string;
    clinicalNotes?: string;
    missedReason?: string;
  }) => Promise<void> | void;
  onReset?: () => void;
}

export const AdministrationModal = ({ isOpen, onClose, mode = 'staff', dose, onRecord, onReview, onCorrect, onReset }: AdministrationModalProps) => {
  const [note, setNote] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [action, setAction] = useState<'recordTaken' | 'recordMissed' | 'approve' | 'reject' | 'correctTaken' | 'correctMissed' | null>(null);
  const { data: historyItems, isLoading: isLoadingHistory } = useDoseHistory(dose?.id);

  if (!dose) return null;

  const statusPresentation = getMedicationDoseStatusPresentation(dose);
  const pendingReview = isDosePendingReview(dose);
  const canReset = Boolean(onReset && (dose.status !== 0 || dose.actualAdministrationAt || dose.notes || dose.missedReason));

  useEffect(() => {
    if (!isOpen) {
      setAction(null);
      setNote("");
      setClinicalNotes("");
      setCorrectionReason("");
    }
  }, [isOpen]);

  const actionTitle = useMemo(() => {
    switch (action) {
      case 'recordTaken':
        return 'ثبت مصرف توسط پرستار';
      case 'recordMissed':
        return 'ثبت مصرف‌نشده';
      case 'approve':
        return 'تأیید ثبت بیمار';
      case 'reject':
        return 'رد ثبت بیمار';
      case 'correctTaken':
        return 'اصلاح به مصرف‌شده';
      case 'correctMissed':
        return 'اصلاح به مصرف‌نشده';
      default:
        return '';
    }
  }, [action]);

  const handleConfirm = async () => {
    if (action === 'recordTaken') {
      await onRecord({
        outcome: MedicationAdministrationOutcome.Taken,
        actualAdministrationAt: new Date().toISOString(),
        notes: note,
        clinicalNotes,
      });
    } else if (action === 'recordMissed') {
      await onRecord({
        outcome: MedicationAdministrationOutcome.Missed,
        notes: note,
        clinicalNotes,
        missedReason: note,
      });
    } else if (action === 'approve') {
      await onReview(true, note, clinicalNotes);
    } else if (action === 'reject') {
      await onReview(false, note, clinicalNotes);
    } else if (action === 'correctTaken' && onCorrect) {
      await onCorrect({
        outcome: MedicationAdministrationOutcome.Taken,
        actualAdministrationAt: new Date().toISOString(),
        correctionReason,
        notes: note,
        clinicalNotes,
      });
    } else if (action === 'correctMissed' && onCorrect) {
      await onCorrect({
        outcome: MedicationAdministrationOutcome.Missed,
        correctionReason,
        notes: note,
        clinicalNotes,
        missedReason: note,
      });
    }

    onClose();
  };

  return (
    <FallbackDialog open={isOpen}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">مدیریت نوبت دارو</h3>
            <p className="text-sm text-gray-500 mt-1">ثبت، بررسی، اصلاح و مشاهده تاریخچه این نوبت مصرف.</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6 flex gap-4 items-center">
          <div className="bg-white p-2 rounded-lg shadow-sm text-teal-600">
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-bold text-teal-900 text-lg">{dose.medicationName}</h4>
            <p className="text-teal-700 font-mono">{dose.dosage} - {dose.route}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusPresentation.className}`}>
                {statusPresentation.label}
              </span>
              <span className="text-xs text-teal-700">بیمار: {dose.patientName}</span>
            </div>
          </div>
        </div>

        {(dose.missedReason || dose.notes || dose.patientComment || dose.clinicalNotes) && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-bold text-slate-800">ثبت قبلی</div>
            {dose.missedReason && (
              <div className="mt-2 text-sm text-slate-700">
                علت عدم مصرف: {dose.missedReason}
              </div>
            )}
            {dose.notes && (
              <div className="mt-2 text-sm text-slate-700">
                یادداشت: {dose.notes}
              </div>
            )}
            {dose.patientComment && (
              <div className="mt-2 text-sm text-slate-700">
                توضیح بیمار: {dose.patientComment}
              </div>
            )}
            {dose.clinicalNotes && (
              <div className="mt-2 text-sm text-slate-700">
                یادداشت بالینی: {dose.clinicalNotes}
              </div>
            )}
          </div>
        )}

        {canReset && (
          <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-amber-800">
                این دوز قبلاً ثبت شده است. در صورت لغو یا حذف ثبت، موجودی دارو به حالت قبل بازمی‌گردد.
              </div>
              <FallbackButton
                variant="outline"
                onClick={() => {
                  onReset?.();
                  onClose();
                }}
                className="shrink-0"
              >
                <RefreshCcw className="w-4 h-4" />
                بازگردانی ثبت
              </FallbackButton>
            </div>
          </div>
        )}

        {!action ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {!pendingReview && (
                <>
                  <button
                    onClick={() => setAction('recordTaken')}
                    className="flex flex-col items-center gap-3 p-6 border-2 border-teal-100 bg-teal-50/50 rounded-2xl hover:border-teal-500 hover:bg-teal-50 transition-all group"
                  >
                    <div className="p-3 bg-teal-100 text-teal-600 rounded-full group-hover:scale-110 transition-transform">
                      <Check className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-teal-900">ثبت مصرف</span>
                  </button>

                  <button
                    onClick={() => setAction('recordMissed')}
                    className="flex flex-col items-center gap-3 p-6 border-2 border-red-100 bg-red-50/50 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all group"
                  >
                    <div className="p-3 bg-red-100 text-red-600 rounded-full group-hover:scale-110 transition-transform">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-red-900">ثبت مصرف‌نشده</span>
                  </button>
                </>
              )}

              {pendingReview && (
                <>
                  <button
                    onClick={() => setAction('approve')}
                    className="flex flex-col items-center gap-3 p-6 border-2 border-emerald-100 bg-emerald-50/50 rounded-2xl hover:border-emerald-500 transition-all group"
                  >
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full group-hover:scale-110 transition-transform">
                      <Check className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-emerald-900">تأیید ثبت بیمار</span>
                  </button>

                  <button
                    onClick={() => setAction('reject')}
                    className="flex flex-col items-center gap-3 p-6 border-2 border-rose-100 bg-rose-50/50 rounded-2xl hover:border-rose-500 transition-all group"
                  >
                    <div className="p-3 bg-rose-100 text-rose-600 rounded-full group-hover:scale-110 transition-transform">
                      <X className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-rose-900">رد ثبت بیمار</span>
                  </button>
                </>
              )}
            </div>

            {mode === 'admin' && onCorrect && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setAction('correctTaken')}
                  className="flex flex-col items-center gap-3 p-4 border border-violet-200 bg-violet-50 rounded-2xl"
                >
                  <div className="rounded-full bg-violet-100 p-3 text-violet-600">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-violet-900">اصلاح به مصرف‌شده</span>
                </button>
                <button
                  onClick={() => setAction('correctMissed')}
                  className="flex flex-col items-center gap-3 p-4 border border-violet-200 bg-violet-50 rounded-2xl"
                >
                  <div className="rounded-full bg-violet-100 p-3 text-violet-600">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-violet-900">اصلاح به مصرف‌نشده</span>
                </button>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <History className="w-4 h-4" />
                تاریخچه نوبت
              </div>
              {isLoadingHistory ? (
                <div className="text-sm text-slate-500">در حال دریافت تاریخچه...</div>
              ) : !historyItems?.length ? (
                <div className="text-sm text-slate-500">تاریخچه‌ای ثبت نشده است.</div>
              ) : (
                <div className="max-h-44 space-y-2 overflow-y-auto">
                  {historyItems.map((item) => (
                    <div key={item.id} className="rounded-xl bg-white p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-slate-800">{item.action}</span>
                        <span className="text-xs text-slate-500">{new Date(item.changedAtUtc).toLocaleString('fa-IR')}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-600">توسط: {item.changedByName || 'سیستم'}</div>
                      {item.reason && <div className="mt-1 text-xs text-slate-600">دلیل: {item.reason}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ClipboardCheck className="w-4 h-4 text-teal-600" />
              {actionTitle}
            </div>

            <textarea
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-200 outline-none resize-none"
              rows={3}
              placeholder={action === 'recordMissed' || action === 'reject' || action === 'correctMissed' ? "دلیل یا توضیح موردنیاز را وارد کنید..." : "توضیحات تکمیلی..."}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <textarea
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-200 outline-none resize-none"
              rows={3}
              placeholder="یادداشت بالینی یا توضیح تکمیلی"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
            />

            {(action === 'correctTaken' || action === 'correctMissed') && (
              <input
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-200 outline-none"
                placeholder="دلیل اصلاح توسط ادمین"
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
              />
            )}

            <div className="flex gap-3 pt-2">
              <FallbackButton variant="ghost" onClick={() => setAction(null)} className="flex-1">
                بازگشت
              </FallbackButton>
              <FallbackButton
                variant={action === 'approve' ? 'primary' : action === 'recordTaken' || action === 'correctTaken' ? 'primary' : 'destructive'}
                className="flex-1"
                disabled={
                  ((action === 'recordMissed' || action === 'reject' || action === 'correctMissed') && !note.trim()) ||
                  ((action === 'correctTaken' || action === 'correctMissed') && !correctionReason.trim())
                }
                onClick={() => void handleConfirm()}
              >
                ثبت نهایی
              </FallbackButton>
            </div>
          </div>
        )}
      </div>
    </FallbackDialog>
  );
};

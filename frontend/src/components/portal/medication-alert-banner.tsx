"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardPenLine, X, ChevronDown, ChevronUp } from "lucide-react";
import { useLogDose } from "@/features/medications/hooks/useKardex";
import { DoseStatus } from "@/types/medication";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

type MedicationAlertBannerDetail = {
  title: string;
  message: string;
  doseId: number;
  severity?: string;
};

interface MedicationAlertBannerProps {
  initialDoseId?: number | null;
}

export function MedicationAlertBanner({ initialDoseId }: MedicationAlertBannerProps) {
  const { mutateAsync: logDose, isPending } = useLogDose();
  const [alert, setAlert] = useState<MedicationAlertBannerDetail | null>(null);
  const [reason, setReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);

  useEffect(() => {
    if (!initialDoseId) return;
    setAlert({
      doseId: initialDoseId,
      title: "هشدار مصرف دارو",
      message: "زمان مصرف این دارو گذشته و هنوز ثبت نشده است. لطفاً وضعیت مصرف را مشخص کنید.",
      severity: "Warning",
    });
  }, [initialDoseId]);

  useEffect(() => {
    const handleMedicationAlert = (event: Event) => {
      const customEvent = event as CustomEvent<MedicationAlertBannerDetail>;
      setAlert(customEvent.detail);
      setShowReasonInput(false);
      setReason("");
    };

    window.addEventListener("portal:medication-alert", handleMedicationAlert as EventListener);
    return () => {
      window.removeEventListener("portal:medication-alert", handleMedicationAlert as EventListener);
    };
  }, []);

  const accentClassName = useMemo(() => {
    return alert?.severity === "Critical"
      ? "border-red-200 bg-red-50/95 text-red-900"
      : "border-amber-200 bg-amber-50/95 text-amber-900";
  }, [alert?.severity]);

  const iconClassName = alert?.severity === "Critical"
    ? "bg-red-100 text-red-600"
    : "bg-amber-100 text-amber-600";

  const dismissBanner = () => {
    setAlert(null);
    setShowReasonInput(false);
    setReason("");
  };

  const handleTaken = async () => {
    if (!alert) return;

    try {
      await logDose({
        doseId: alert.doseId,
        status: DoseStatus.Taken,
        takenAt: new Date().toISOString(),
      });
      toast.success("مصرف دارو ثبت شد.");
      dismissBanner();
    } catch {
      toast.error("ثبت مصرف دارو انجام نشد.");
    }
  };

  const handleSkip = async () => {
    if (!alert) return;

    try {
      await logDose({
        doseId: alert.doseId,
        status: DoseStatus.Skipped,
        missedReason: reason.trim() || undefined,
        takenAt: new Date().toISOString(),
      });
      toast.success("عدم مصرف دارو ثبت شد.");
      dismissBanner();
    } catch {
      toast.error("ثبت عدم مصرف دارو انجام نشد.");
    }
  };

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`sticky top-20 z-30 mb-6 rounded-3xl border p-5 shadow-xl backdrop-blur-xl ${accentClassName}`}
        >
          <div className="flex items-start gap-4">
            <motion.div 
              animate={alert.severity === "Critical" ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${iconClassName}`}
            >
              <AlertTriangle className="h-6 w-6" />
            </motion.div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold">{alert.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed opacity-90 font-medium">{alert.message}</p>
                </div>
                <button
                  type="button"
                  onClick={dismissBanner}
                  className="rounded-full bg-white/50 p-2 text-slate-500 transition hover:bg-white hover:shadow-sm"
                  aria-label="بستن هشدار"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => void handleTaken()}
                  disabled={isPending}
                  className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  مصرف شد
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowReasonInput((current) => !current)}
                  disabled={isPending}
                  className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-2xl border border-current/20 bg-white/80 px-5 py-2.5 text-sm font-bold shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <ClipboardPenLine className="h-4 w-4" />
                  {showReasonInput ? "بستن توضیحات" : "عدم مصرف / ثبت دلیل"}
                  {showReasonInput ? <ChevronUp className="h-4 w-4 opacity-70" /> : <ChevronDown className="h-4 w-4 opacity-70" />}
                </motion.button>
              </div>

              <AnimatePresence>
                {showReasonInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                      <label className="mb-2 block text-sm font-bold text-slate-800">
                        در صورت تمایل، دلیل عدم مصرف را بنویسید (اختیاری):
                      </label>
                      <textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        rows={2}
                        placeholder="مثلاً: خواب بودم، تهوع داشتم، بعداً مصرف می‌کنم..."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-inner outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
                      />
                      <div className="mt-4 flex flex-wrap gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => void handleSkip()}
                          disabled={isPending}
                          className="flex-1 sm:flex-none rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          ثبت نهایی عدم مصرف
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => setShowReasonInput(false)}
                          disabled={isPending}
                          className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          انصراف
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

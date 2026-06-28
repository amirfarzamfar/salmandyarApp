"use client";

import { PortalCard } from "./ui/portal-card";
import { PortalButton } from "./ui/portal-button";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  List,
  Pill,
  Sparkles
} from "lucide-react";
import { CardSkeleton } from "./ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useKardex, useLogDose } from "@/features/medications/hooks/useKardex";
import { DoseStatus, MedicationDose } from "@/types/medication";
import { PatientSelfServiceFeatureStatus } from "@/types/patient-self-service";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import { useEffect, useMemo, useRef, useState } from "react";
import { PatientMedicationList } from "@/features/medications/components/patient/PatientMedicationList";
import { X } from "lucide-react";
import { StockStatusBadge } from "@/features/medications/components/shared/StockStatusBadge";

interface MedicationTimelineProps {
  patientId?: number;
  medicationAccess?: PatientSelfServiceFeatureStatus | null;
  highlightedDoseId?: number | null;
}

export function MedicationTimeline({ patientId, medicationAccess, highlightedDoseId }: MedicationTimelineProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: doses, isLoading } = useKardex(patientId ?? 0, today);
  const { mutateAsync: logDose, isPending: isLoggingDose } = useLogDose();
  const [showList, setShowList] = useState(false);
  const [activeDoseId, setActiveDoseId] = useState<number | null>(null);
  const doseRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const normalizedDoses = useMemo(() => (doses ?? []) as MedicationDose[], [doses]);
  const now = useMemo(() => new Date(), [normalizedDoses]);

  const dueDoses = useMemo(
    () =>
      normalizedDoses.filter((dose) => {
        if (dose.status === DoseStatus.Taken) {
          return false;
        }

        const scheduled = parseISO(dose.scheduledTime);
        return !Number.isNaN(scheduled.getTime()) && scheduled <= now;
      }),
    [normalizedDoses, now]
  );

  const upcomingDoses = useMemo(
    () =>
      normalizedDoses.filter((dose) => {
        if (dose.status === DoseStatus.Taken) {
          return false;
        }

        const scheduled = parseISO(dose.scheduledTime);
        return Number.isNaN(scheduled.getTime()) || scheduled > now;
      }),
    [normalizedDoses, now]
  );

  const completedDoses = useMemo(
    () => normalizedDoses.filter((dose) => dose.status === DoseStatus.Taken),
    [normalizedDoses]
  );

  const nextDose = dueDoses[0] ?? upcomingDoses[0] ?? null;
  const completedCount = completedDoses.length;
  const totalCount = normalizedDoses.length;
  const dueCount = dueDoses.length;
  const upcomingCount = upcomingDoses.length;
  const hasImplicitSelfConfirmNotice = Boolean(medicationAccess && !medicationAccess.canSubmitNow);

  useEffect(() => {
    if (!highlightedDoseId) return;
    const el = doseRefs.current[highlightedDoseId];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [highlightedDoseId, normalizedDoses.length]);

  const handleTakeMed = async (doseId: number, scheduledTime?: string) => {
    if (scheduledTime) {
      const scheduled = parseISO(scheduledTime);
      if (!Number.isNaN(scheduled.getTime()) && new Date() < scheduled) {
        const timeLabel = scheduled.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
        toast.error(`زمان مصرف این دارو هنوز نرسیده است. زمان برنامه‌ریزی‌شده: ${timeLabel}`);
        return;
      }
    }

    try {
      setActiveDoseId(doseId);
      await logDose({
        doseId,
        status: DoseStatus.Taken,
        takenAt: new Date().toISOString()
      });
      toast.success("مصرف دارو ثبت شد");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "ثبت مصرف دارو انجام نشد.");
    } finally {
      setActiveDoseId(null);
    }
  };

  if (isLoading) return <CardSkeleton />;

  if (!patientId) {
    return <CardSkeleton />;
  }

  return (
    <div className="mb-10 space-y-6">
      <PortalCard className="overflow-visible bg-gradient-to-br from-white via-white to-medical-50/60">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-medical-100 text-medical-700">
                <Pill className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">داروهای امروز</h2>
                <p className="mt-1 text-sm text-slate-500">
                  دوزهایی که زمانشان رسیده را سریع و بدون پیچیدگی تایید کنید.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SummaryPill label="کل دوزها" value={totalCount.toString()} tone="slate" />
              <SummaryPill label="نیازمند اقدام" value={dueCount.toString()} tone="amber" />
              <SummaryPill label="در ادامه روز" value={upcomingCount.toString()} tone="blue" />
              <SummaryPill label="ثبت‌شده" value={completedCount.toString()} tone="green" />
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 lg:max-w-sm">
            <div className="rounded-[28px] border border-medical-100 bg-white/90 p-4 shadow-soft-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-slate-500">نزدیک‌ترین نوبت</div>
                  <div className="mt-1 font-bold text-slate-900">
                    {nextDose ? nextDose.medicationName : "برای امروز نوبتی ثبت نشده"}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {nextDose ? formatDoseTime(nextDose.scheduledTime) : "روز آرامی پیش رو دارید"}
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-medical-50 text-medical-600">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowList(true)}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-medical-200 hover:bg-medical-50"
              >
                <List className="h-4 w-4" />
                لیست کامل داروها
              </button>
              <div className="flex items-center gap-2 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700">
                <CheckCircle2 className="h-4 w-4" />
                تایید مصرف فقط برای دوزهای موعدرسیده فعال است
              </div>
            </div>
          </div>
        </div>
      </PortalCard>

      {hasImplicitSelfConfirmNotice && (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
          برای تایید مصرف داروهای موعدرسیده در این بخش، دیگر نیازی به فعال‌سازی ادمین ندارید.
          سایر عملیات کاردکس ممکن است همچنان بر اساس تنظیمات دسترسی کنترل شوند.
        </div>
      )}

      {!normalizedDoses.length ? (
        <PortalCard className="border border-dashed border-slate-200 bg-slate-50/70 text-center">
          <div className="py-6 text-slate-500">امروز هیچ دارویی برای شما برنامه‌ریزی نشده است.</div>
        </PortalCard>
      ) : (
        <div className="space-y-5">
          <DoseSection
            title="الان باید انجام شود"
            description="داروهایی که زمان مصرفشان رسیده و آماده تایید هستند."
            tone="amber"
            doses={dueDoses}
            highlightedDoseId={highlightedDoseId}
            activeDoseId={activeDoseId}
            isLoggingDose={isLoggingDose}
            doseRefs={doseRefs}
            onTakeMed={handleTakeMed}
          />

          <DoseSection
            title="در ادامه امروز"
            description="دوزهای بعدی که هنوز زمان مصرفشان نرسیده است."
            tone="blue"
            doses={upcomingDoses}
            highlightedDoseId={highlightedDoseId}
            activeDoseId={activeDoseId}
            isLoggingDose={isLoggingDose}
            doseRefs={doseRefs}
            onTakeMed={handleTakeMed}
          />

          <DoseSection
            title="ثبت‌شده‌های امروز"
            description="داروهایی که مصرفشان برای امروز ثبت شده است."
            tone="green"
            doses={completedDoses}
            highlightedDoseId={highlightedDoseId}
            activeDoseId={activeDoseId}
            isLoggingDose={isLoggingDose}
            doseRefs={doseRefs}
            onTakeMed={handleTakeMed}
          />
        </div>
      )}

      {/* Full List Modal */}
      <AnimatePresence>
        {showList && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowList(false)}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-2xl bg-white rounded-[2rem] p-6 max-h-[85vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">لیست کامل داروها</h3>
                        <button onClick={() => setShowList(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <PatientMedicationList
                      patientId={patientId}
                      allowEdit={Boolean(medicationAccess?.canSubmitNow)}
                      allowDelete={false}
                      allowInventoryManagement={false}
                    />
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DoseSectionProps {
  title: string;
  description: string;
  tone: "amber" | "blue" | "green";
  doses: MedicationDose[];
  highlightedDoseId?: number | null;
  activeDoseId: number | null;
  isLoggingDose: boolean;
  doseRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  onTakeMed: (doseId: number, scheduledTime?: string) => void | Promise<void>;
}

function DoseSection({
  title,
  description,
  tone,
  doses,
  highlightedDoseId,
  activeDoseId,
  isLoggingDose,
  doseRefs,
  onTakeMed
}: DoseSectionProps) {
  const toneClasses = {
    amber: {
      badge: "bg-amber-100 text-amber-800",
      icon: "bg-amber-50 text-amber-600",
      border: "border-amber-100"
    },
    blue: {
      badge: "bg-sky-100 text-sky-800",
      icon: "bg-sky-50 text-sky-600",
      border: "border-sky-100"
    },
    green: {
      badge: "bg-emerald-100 text-emerald-800",
      icon: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100"
    }
  }[tone];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 px-1 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${toneClasses.badge}`}>
              {doses.length} مورد
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      {doses.length === 0 ? (
        <div className={`rounded-3xl border border-dashed bg-white px-5 py-6 text-sm text-slate-500 ${toneClasses.border}`}>
          موردی در این بخش وجود ندارد.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {doses.map((dose) => {
            const scheduled = parseISO(dose.scheduledTime);
            const isEarly = dose.status !== DoseStatus.Taken && !Number.isNaN(scheduled.getTime()) && new Date() < scheduled;
            const isTaken = dose.status === DoseStatus.Taken;
            const isBusy = isLoggingDose && activeDoseId === dose.id;

            return (
              <div
                key={dose.id}
                ref={(el) => {
                  doseRefs.current[dose.id] = el;
                }}
                className={dose.id === highlightedDoseId ? "rounded-[36px] ring-2 ring-red-400 ring-offset-4 ring-offset-white" : ""}
              >
                <PortalCard
                  variant={isTaken ? "calm" : "default"}
                  className="h-full border border-slate-100 bg-white/95"
                  noPadding
                >
                  <div className="flex h-full flex-col gap-5 p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${toneClasses.icon}`}>
                          <Pill className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className={`text-lg font-bold ${isTaken ? "text-slate-500 line-through decoration-2 decoration-emerald-400" : "text-slate-900"}`}>
                              {dose.medicationName}
                            </h4>
                            <StatusBadge dose={dose} />
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            {dose.dosage} - {dose.route}
                          </p>
                        </div>
                      </div>

                      {isTaken ? (
                        <div className="rounded-full bg-emerald-500 p-1.5 text-white">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="rounded-full bg-slate-100 p-1.5 text-slate-500">
                          <ChevronLeft className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoTile
                        label="زمان مصرف"
                        value={formatDoseTime(dose.scheduledTime)}
                        icon={<Clock className="h-4 w-4" />}
                      />
                      <InfoTile
                        label="وضعیت ثبت"
                        value={isTaken ? "مصرف ثبت شده" : isEarly ? "هنوز زمان نرسیده" : "آماده تایید"}
                        icon={<AlertCircle className="h-4 w-4" />}
                      />
                    </div>

                    {(dose.instructions || dose.currentQuantity >= 0) && (
                      <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                        {dose.instructions && (
                          <p className="text-sm leading-7 text-slate-600">{dose.instructions}</p>
                        )}
                        <div className={dose.instructions ? "mt-3" : ""}>
                          <StockStatusBadge
                            medication={{
                              totalQuantity: dose.currentQuantity,
                              alertLimit: dose.alertLimit,
                              stockStatus: dose.stockStatus,
                              stockStatusLabel: dose.stockStatusLabel
                            }}
                            compact
                          />
                        </div>
                      </div>
                    )}

                    <PortalButton
                      variant={isTaken ? "calm" : "primary"}
                      onClick={() => void onTakeMed(dose.id, dose.scheduledTime)}
                      disabled={isTaken || isEarly || isBusy}
                      isLoading={isBusy}
                      className="w-full shadow-none"
                    >
                      {isTaken ? "برای امروز ثبت شده" : isEarly ? "هنوز زمانش نرسیده" : "تایید مصرف این دارو"}
                    </PortalButton>

                    {isEarly && (
                      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        هنوز زمان مصرف این دارو نرسیده است.
                      </div>
                    )}
                  </div>
                </PortalCard>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SummaryPill({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "slate" | "amber" | "blue" | "green";
}) {
  const classes = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-sky-50 text-sky-700",
    green: "bg-emerald-50 text-emerald-700"
  }[tone];

  return (
    <div className={`rounded-2xl px-4 py-3 ${classes}`}>
      <div className="text-xs font-medium">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}

function InfoTile({
  label,
  value,
  icon
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-base font-bold text-slate-900">{value}</div>
    </div>
  );
}

function StatusBadge({ dose }: { dose: MedicationDose }) {
  const config =
    dose.status === DoseStatus.Taken
      ? { label: "ثبت شده", className: "bg-emerald-100 text-emerald-700" }
      : dose.status === DoseStatus.Late
        ? { label: "با تاخیر", className: "bg-rose-100 text-rose-700" }
        : dose.status === DoseStatus.Due
          ? { label: "موعد رسیده", className: "bg-amber-100 text-amber-700" }
          : { label: "برنامه‌ریزی شده", className: "bg-sky-100 text-sky-700" };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${config.className}`}>
      {config.label}
    </span>
  );
}

function formatDoseTime(scheduledTime: string) {
  const scheduled = parseISO(scheduledTime);
  if (Number.isNaN(scheduled.getTime())) {
    return "نامشخص";
  }

  return scheduled.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

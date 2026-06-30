"use client";

import { PortalCard } from "./ui/portal-card";
import { PortalButton } from "./ui/portal-button";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  Filter,
  History,
  Pill,
  Search,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { CardSkeleton } from "./ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  useConfirmDoseByPatient,
  useDoseHistory,
  useKardex,
  usePatientMedicationHistory,
  useSkipDoseByPatient,
} from "@/features/medications/hooks/useKardex";
import {
  MedicationAdministrationOutcome,
  MedicationDose,
  MedicationTimingStatus,
  PatientMedicationHistoryFilters,
} from "@/types/medication";
import { PatientSelfServiceFeatureStatus } from "@/types/patient-self-service";
import { addDays, format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { StockStatusBadge } from "@/features/medications/components/shared/StockStatusBadge";
import {
  getMedicationDoseStatusPresentation,
  isDoseCompleted,
  isDosePendingReview,
} from "@/features/medications/lib/administration-ui";
import { formatTehranDateValue } from "@/lib/tehran-date";

interface MedicationTimelineProps {
  patientId?: number;
  medicationAccess?: PatientSelfServiceFeatureStatus | null;
  highlightedDoseId?: number | null;
}

export function MedicationTimeline({ patientId, medicationAccess, highlightedDoseId }: MedicationTimelineProps) {
  const today = formatTehranDateValue(new Date());
  const { data: doses, isLoading } = useKardex(patientId ?? 0, today);
  const { mutateAsync: confirmDose, isPending: isConfirming } = useConfirmDoseByPatient();
  const { mutateAsync: skipDose, isPending: isSkipping } = useSkipDoseByPatient();
  const [activeDoseId, setActiveDoseId] = useState<number | null>(null);
  const [historyDoseId, setHistoryDoseId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"today" | "history">("today");
  const [showOverdue, setShowOverdue] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyOutcome, setHistoryOutcome] = useState<string>("");
  const [historyTiming, setHistoryTiming] = useState<string>("");
  const [onlyIssues, setOnlyIssues] = useState(false);
  const [historyFrom, setHistoryFrom] = useState(formatTehranDateValue(addDays(new Date(), -30)));
  const [historyTo, setHistoryTo] = useState(today);
  const doseRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const { data: historyItems, isLoading: isHistoryLoading } = useDoseHistory(historyDoseId);

  const normalizedDoses = useMemo(() => (doses ?? []) as MedicationDose[], [doses]);
  const now = new Date();
  const historyFilters = useMemo<PatientMedicationHistoryFilters>(() => ({
    from: historyFrom,
    to: historyTo,
    administrationOutcome: historyOutcome === "" ? undefined : Number(historyOutcome) as MedicationAdministrationOutcome,
    timingStatus: historyTiming === "" ? undefined : Number(historyTiming) as MedicationTimingStatus,
    onlyIssues,
    search: historySearch.trim() || undefined,
  }), [historyFrom, historyOutcome, historySearch, historyTiming, historyTo, onlyIssues]);
  const { data: patientHistory, isLoading: isLoadingHistoryList } = usePatientMedicationHistory(patientId ?? 0, historyFilters);

  const actionableDoses = useMemo(
    () =>
      normalizedDoses.filter((dose) => {
        if (isDoseCompleted(dose)) {
          return false;
        }

        const scheduled = parseISO(dose.scheduledTime);
        return !Number.isNaN(scheduled.getTime()) && scheduled >= now;
      }),
    [normalizedDoses, now]
  );

  const overdueDoses = useMemo(
    () =>
      normalizedDoses.filter((dose) => {
        if (isDoseCompleted(dose)) {
          return false;
        }

        const scheduled = parseISO(dose.scheduledTime);
        return !Number.isNaN(scheduled.getTime()) && scheduled < now;
      }),
    [normalizedDoses, now]
  );

  const completedDoses = useMemo(
    () => normalizedDoses.filter((dose) => isDoseCompleted(dose)),
    [normalizedDoses]
  );

  const nextDose = actionableDoses[0] ?? overdueDoses[0] ?? null;
  const completedCount = completedDoses.filter((dose) => dose.administrationOutcome === 1).length;
  const totalCount = normalizedDoses.length;
  const dueCount = actionableDoses.length;
  const overdueCount = overdueDoses.length;
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
      await confirmDose({
        doseId,
        actualAdministrationAt: new Date().toISOString(),
      });
      toast.success("مصرف دارو ثبت شد و برای پرستار قابل مشاهده است");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "ثبت مصرف دارو انجام نشد.");
    } finally {
      setActiveDoseId(null);
    }
  };

  const handleSkipDose = async (doseId: number) => {
    const reason = window.prompt("علت عدم مصرف را وارد کنید:");
    if (!reason?.trim()) {
      return;
    }

    try {
      setActiveDoseId(doseId);
      await skipDose({
        doseId,
        reason,
      });
      toast.success("عدم مصرف دارو ثبت شد");
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
              <SummaryPill label="منتظر مصرف" value={dueCount.toString()} tone="blue" />
              <SummaryPill label="گذشته از زمان" value={overdueCount.toString()} tone="amber" />
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
                onClick={() => setActiveTab("history")}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-medical-200 hover:bg-medical-50"
              >
                <History className="h-4 w-4" />
                تاریخچه مصرف
              </button>
              <div className="flex items-center gap-2 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700">
                <CheckCircle2 className="h-4 w-4" />
                فقط نوبت‌های منتظر مصرف در نمای اصلی نمایش داده می‌شوند
              </div>
            </div>
          </div>
        </div>
      </PortalCard>

      <div className="flex w-full rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-100">
        <button
          type="button"
          onClick={() => setActiveTab("today")}
          className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${activeTab === "today" ? "bg-medical-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
        >
          امروز
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${activeTab === "history" ? "bg-medical-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
        >
          تاریخچه مصرف
        </button>
      </div>

     

      {activeTab === "today" && !normalizedDoses.length ? (
        <PortalCard className="border border-dashed border-slate-200 bg-slate-50/70 text-center">
          <div className="py-6 text-slate-500">امروز هیچ دارویی برای شما برنامه‌ریزی نشده است.</div>
        </PortalCard>
      ) : activeTab === "today" ? (
        <div className="space-y-5">
          <DoseSection
            title="نوبت‌های در انتظار امروز"
            description="فقط داروهایی که هنوز زمان مصرفشان نرسیده یا در صف مصرف امروز هستند."
            tone="blue"
            doses={actionableDoses}
            emptyMessage="در حال حاضر نوبت بازی برای ادامه روز ندارید."
            highlightedDoseId={highlightedDoseId}
            activeDoseId={activeDoseId}
            isLoadingAction={isConfirming || isSkipping}
            doseRefs={doseRefs}
            onTakeMed={handleTakeMed}
            onSkipDose={handleSkipDose}
            onOpenHistory={setHistoryDoseId}
          />

          <CollapsibleDoseSection
            title="گذشته از زمان مصرف"
            description="نوبت‌هایی که زمان مصرفشان گذشته است."
            tone="amber"
            doses={overdueDoses}
            isOpen={showOverdue}
            onToggle={() => setShowOverdue((value) => !value)}
            highlightedDoseId={highlightedDoseId}
            activeDoseId={activeDoseId}
            isLoadingAction={isConfirming || isSkipping}
            doseRefs={doseRefs}
            onTakeMed={handleTakeMed}
            onSkipDose={handleSkipDose}
            onOpenHistory={setHistoryDoseId}
          />

          <CollapsibleDoseSection
            title="مصرف‌شده‌ها و ثبت‌های امروز"
            description="نوبت‌های ثبت‌شده امروز ."
            tone="green"
            doses={completedDoses}
            isOpen={showCompleted}
            onToggle={() => setShowCompleted((value) => !value)}
            highlightedDoseId={highlightedDoseId}
            activeDoseId={activeDoseId}
            isLoadingAction={isConfirming || isSkipping}
            doseRefs={doseRefs}
            onTakeMed={handleTakeMed}
            onSkipDose={handleSkipDose}
            onOpenHistory={setHistoryDoseId}
          />
        </div>
      ) : (
        <MedicationHistoryPanel
          doses={(patientHistory ?? []) as MedicationDose[]}
          isLoading={isLoadingHistoryList}
          filters={historyFilters}
          onChangeSearch={setHistorySearch}
          onChangeOutcome={setHistoryOutcome}
          onChangeTiming={setHistoryTiming}
          onChangeOnlyIssues={setOnlyIssues}
          onChangeFrom={setHistoryFrom}
          onChangeTo={setHistoryTo}
          onOpenHistory={setHistoryDoseId}
        />
      )}

      <AnimatePresence>
        {historyDoseId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setHistoryDoseId(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-2xl rounded-[2rem] bg-white p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">تاریخچه ثبت این نوبت</h3>
                  <p className="mt-1 text-sm text-slate-500">همه تغییرات، تاییدها و اصلاح‌ها در این بخش ثبت می‌شود.</p>
                </div>
                <button onClick={() => setHistoryDoseId(null)} className="rounded-full bg-slate-100 p-2 text-slate-500">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {isHistoryLoading ? (
                <div className="py-10 text-center text-slate-500">در حال دریافت تاریخچه...</div>
              ) : !historyItems?.length ? (
                <div className="rounded-3xl border border-dashed border-slate-200 px-5 py-8 text-center text-slate-500">
                  هنوز سابقه‌ای برای این نوبت ثبت نشده است.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyItems.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-bold text-slate-900">{item.action}</div>
                        <div className="text-xs text-slate-500">
                          {new Date(item.changedAtUtc).toLocaleString('fa-IR')}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">
                        توسط: {item.changedByName || 'سیستم'}
                      </div>
                      {item.reason && <div className="mt-2 text-sm text-slate-700">دلیل: {item.reason}</div>}
                      {item.notes && <div className="mt-1 text-sm text-slate-700">یادداشت: {item.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
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
  emptyMessage?: string;
  hideHeader?: boolean;
  highlightedDoseId?: number | null;
  activeDoseId: number | null;
  isLoadingAction: boolean;
  doseRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  onTakeMed: (doseId: number, scheduledTime?: string) => void | Promise<void>;
  onSkipDose: (doseId: number) => void | Promise<void>;
  onOpenHistory: (doseId: number) => void;
}

function toDatePickerValue(value?: string) {
  return value ? new Date(`${value}T12:00:00`) : undefined;
}

function DoseSection({
  title,
  description,
  tone,
  doses,
  emptyMessage,
  hideHeader,
  highlightedDoseId,
  activeDoseId,
  isLoadingAction,
  doseRefs,
  onTakeMed,
  onSkipDose,
  onOpenHistory
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
      {!hideHeader ? (
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
      ) : null}

      {doses.length === 0 ? (
        <div className={`rounded-3xl border border-dashed bg-white px-5 py-6 text-sm text-slate-500 ${toneClasses.border}`}>
          {emptyMessage ?? "موردی در این بخش وجود ندارد."}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {doses.map((dose) => {
            const scheduled = parseISO(dose.scheduledTime);
            const isEarly = !isDoseCompleted(dose) && !Number.isNaN(scheduled.getTime()) && new Date() < scheduled;
            const isCompleted = isDoseCompleted(dose);
            const isBusy = isLoadingAction && activeDoseId === dose.id;
            const statusPresentation = getMedicationDoseStatusPresentation(dose);
            const pendingReview = isDosePendingReview(dose);

            return (
              <div
                key={dose.id}
                ref={(el) => {
                  doseRefs.current[dose.id] = el;
                }}
                className={dose.id === highlightedDoseId ? "rounded-[36px] ring-2 ring-red-400 ring-offset-4 ring-offset-white" : ""}
              >
                <PortalCard
                  variant={isCompleted ? "calm" : "default"}
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
                            <h4 className={`text-lg font-bold ${isCompleted ? "text-slate-500" : "text-slate-900"}`}>
                              {dose.medicationName}
                            </h4>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusPresentation.className}`}>
                              {statusPresentation.label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            {dose.dosage} - {dose.route}
                          </p>
                        </div>
                      </div>

                      {isCompleted ? (
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
                        value={pendingReview ? "در انتظار تأیید پرستار" : isCompleted ? statusPresentation.label : isEarly ? "هنوز زمان نرسیده" : "آماده تایید"}
                        icon={<AlertCircle className="h-4 w-4" />}
                      />
                    </div>

                    {dose.recordedByName && (
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        ثبت‌کننده: {dose.recordedByName}
                        {dose.verifiedByName ? ` - تأیید: ${dose.verifiedByName}` : ''}
                      </div>
                    )}

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

                    <div className="grid gap-3 sm:grid-cols-2">
                      <PortalButton
                        variant={isCompleted ? "calm" : "primary"}
                        onClick={() => void onTakeMed(dose.id, dose.scheduledTime)}
                        disabled={isCompleted || isEarly || isBusy}
                        isLoading={isBusy}
                        className="w-full shadow-none"
                      >
                        {isCompleted ? "برای امروز ثبت شده" : isEarly ? "هنوز زمانش نرسیده" : "تایید مصرف"}
                      </PortalButton>
                      <PortalButton
                        variant="outline"
                        onClick={() => void onSkipDose(dose.id)}
                        disabled={isCompleted || isEarly || isBusy}
                        className="w-full shadow-none"
                      >
                        مصرف نکردم
                      </PortalButton>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenHistory(dose.id)}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <History className="h-4 w-4" />
                      مشاهده تاریخچه
                    </button>

                    {isEarly && (
                      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        هنوز زمان مصرف این دارو نرسیده است.
                      </div>
                    )}

                    {pendingReview && (
                      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          ثبت شما انجام شده و منتظر بررسی تیم درمان است.
                        </div>
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

function CollapsibleDoseSection(props: DoseSectionProps & { isOpen: boolean; onToggle: () => void }) {
  const { title, description, doses, isOpen, onToggle, tone, ...rest } = props;

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-white px-5 py-4 text-right shadow-sm transition hover:bg-slate-50"
      >
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
              {doses.length} مورد
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
      </button>

      {isOpen ? <DoseSection title={title} description={description} tone={tone} doses={doses} hideHeader {...rest} /> : null}
    </section>
  );
}

function MedicationHistoryPanel({
  doses,
  isLoading,
  filters,
  onChangeSearch,
  onChangeOutcome,
  onChangeTiming,
  onChangeOnlyIssues,
  onChangeFrom,
  onChangeTo,
  onOpenHistory,
}: {
  doses: MedicationDose[];
  isLoading: boolean;
  filters: PatientMedicationHistoryFilters;
  onChangeSearch: (value: string) => void;
  onChangeOutcome: (value: string) => void;
  onChangeTiming: (value: string) => void;
  onChangeOnlyIssues: (value: boolean) => void;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
  onOpenHistory: (doseId: number) => void;
}) {
  return (
    <div className="space-y-5">
      <PortalCard className="bg-white">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-medical-600" />
            <h3 className="text-lg font-bold text-slate-900">فیلتر تاریخچه مصرف</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <DatePicker
              value={toDatePickerValue(filters.from)}
              onChange={(date: any) => {
                if (date?.isValid) {
                  onChangeFrom(formatTehranDateValue(date.toDate()));
                } else {
                  onChangeFrom("");
                }
              }}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              inputClass="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-medical-400"
              containerStyle={{ width: "100%" }}
              placeholder="از تاریخ"
            />
            <DatePicker
              value={toDatePickerValue(filters.to)}
              onChange={(date: any) => {
                if (date?.isValid) {
                  onChangeTo(formatTehranDateValue(date.toDate()));
                } else {
                  onChangeTo("");
                }
              }}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              inputClass="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-medical-400"
              containerStyle={{ width: "100%" }}
              placeholder="تا تاریخ"
            />
            <div className="relative">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filters.search ?? ""}
                onChange={(event) => onChangeSearch(event.target.value)}
                placeholder="جستجو در نام دارو یا علت عدم مصرف"
                className="w-full rounded-2xl border border-slate-200 py-3 pr-10 pl-4 outline-none focus:border-medical-400"
              />
            </div>
            <select
              value={filters.administrationOutcome ?? ""}
              onChange={(event) => onChangeOutcome(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-medical-400"
            >
              <option value="">همه وضعیت‌های مصرف</option>
              <option value={MedicationAdministrationOutcome.Taken}>مصرف شده</option>
              <option value={MedicationAdministrationOutcome.Missed}>فراموش شده</option>
              <option value={MedicationAdministrationOutcome.SkippedByPatient}>مصرف نکردم</option>
            </select>
            <select
              value={filters.timingStatus ?? ""}
              onChange={(event) => onChangeTiming(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-medical-400"
            >
              <option value="">همه وضعیت‌های زمانی</option>
              <option value={MedicationTimingStatus.OnTime}>به‌موقع</option>
              <option value={MedicationTimingStatus.Late}>با تأخیر</option>
              <option value={MedicationTimingStatus.Missed}>Missed</option>
            </select>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(filters.onlyIssues)}
                onChange={(event) => onChangeOnlyIssues(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              فقط موارد مسئله‌دار
            </label>
          </div>
        </div>
      </PortalCard>

      {isLoading ? (
        <CardSkeleton />
      ) : !doses.length ? (
        <PortalCard className="border border-dashed border-slate-200 bg-slate-50/70 text-center">
          <div className="py-8 text-slate-500">موردی برای تاریخچه مصرف با این فیلترها پیدا نشد.</div>
        </PortalCard>
      ) : (
        <div className="space-y-3">
          {doses.map((dose) => {
            const statusPresentation = getMedicationDoseStatusPresentation(dose);

            return (
              <PortalCard key={dose.id} className="bg-white">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-bold text-slate-900">{dose.medicationName}</h4>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusPresentation.className}`}>
                        {statusPresentation.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span>زمان برنامه‌ریزی: {new Date(dose.scheduledTime).toLocaleString("fa-IR")}</span>
                      {dose.actualAdministrationAt ? (
                        <span>زمان ثبت: {new Date(dose.actualAdministrationAt).toLocaleString("fa-IR")}</span>
                      ) : null}
                      {typeof dose.delayMinutes === "number" ? <span>تاخیر: {dose.delayMinutes} دقیقه</span> : null}
                    </div>
                    {(dose.missedReason || dose.patientComment || dose.notes || dose.clinicalNotes) && (
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        {dose.missedReason ? <div>علت عدم مصرف: {dose.missedReason}</div> : null}
                        {dose.patientComment ? <div>توضیح بیمار: {dose.patientComment}</div> : null}
                        {dose.notes ? <div>یادداشت: {dose.notes}</div> : null}
                        {dose.clinicalNotes ? <div>یادداشت بالینی: {dose.clinicalNotes}</div> : null}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenHistory(dose.id)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <History className="h-4 w-4" />
                    جزئیات و تاریخچه نوبت
                  </button>
                </div>
              </PortalCard>
            );
          })}
        </div>
      )}
    </div>
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

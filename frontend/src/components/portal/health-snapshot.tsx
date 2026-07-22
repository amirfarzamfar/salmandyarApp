"use client";

import { type ComponentType, useMemo, useState } from "react";
import { PortalCard } from "./ui/portal-card";
import { Activity, Heart, Thermometer, Droplet, RefreshCw, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { patientService } from "@/services/patient.service";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import { toast } from "react-hot-toast";
import { evaluateVitalAlerts, getVitalDisplayStatus, getVitalStatusMeta } from "@/utils/vital-alerts";
import { evaluateBloodSugar } from "@/utils/blood-sugar";
import { VitalSign, VitalSignAlert } from "@/types/patient";
import { getVitalAcknowledgementErrorMessage, normalizePatientAcknowledgementNote } from "@/utils/vital-acknowledgement";

// Helper to generate chart data from history
type VitalChartKey = keyof Pick<VitalSign, "systolicBloodPressure" | "pulseRate" | "oxygenSaturation" | "bodyTemperature" | "bloodSugar">;

const getChartData = (vitals: VitalSign[], key: VitalChartKey, limit = 10) => {
  if (!vitals || vitals.length === 0) return Array(10).fill({ value: 0 });
  
  // Sort by date ascending
  const sorted = [...vitals].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  // Take last N
  const slice = sorted.slice(-limit);
  
  return slice.map(v => {
    const raw = v[key];
    return { value: typeof raw === "number" ? raw : null };
  });
};

interface VitalCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number | string }>;
  color: string;
  trend: string;
  data: Array<{ value: number | null }>;
  statusClassName: string;
  subtitle?: string;
}

const VitalCard = ({ title, value, unit, icon: Icon, color, trend, data, statusClassName, subtitle }: VitalCardProps) => {
  const textColor = color.replace("bg-", "text-");

  return (
    <PortalCard className="relative overflow-hidden group hover:shadow-soft-lg transition-all duration-500" noPadding>
      <div className="p-4 md:p-6 relative z-10">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className={`p-2 md:p-3 rounded-2xl ${color} text-white shadow-md transition-transform group-hover:scale-105`}>
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />
          </div>
          <span className={`text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full border shadow-sm ${statusClassName}`}>
            {trend}
          </span>
        </div>
        
        <div className="space-y-0.5 md:space-y-1">
          <span className="text-xs md:text-sm font-medium text-gray-500 block">{title}</span>
          {subtitle ? <span className="text-[10px] md:text-xs text-gray-400 block">{subtitle}</span> : null}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">{value}</span>
            <span className="text-xs md:text-sm text-gray-400 font-medium">{unit}</span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="currentColor" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="currentColor" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="currentColor" 
              fill={`url(#gradient-${title})`} 
              className={textColor}
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </PortalCard>
  );
};

interface HealthSnapshotProps {
  patientId: number;
}

export function HealthSnapshot({ patientId }: HealthSnapshotProps) {
  const queryClient = useQueryClient();
  const [ackNote, setAckNote] = useState("");
  const [dismissedAlertKey, setDismissedAlertKey] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.sessionStorage.getItem(`portal-vital-alert-dismissed:${patientId}`) ?? "";
  });
  // #region debug-point C:portal-health-mount
  useMemo(() => {
    fetch("http://127.0.0.1:7777/event", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "vitals-realtime-sync",
        runId: "pre-fix",
        hypothesisId: "C",
        location: "health-snapshot:mount",
        msg: "[DEBUG] Portal health snapshot mounted",
        data: { patientId },
        ts: Date.now()
      })
    }).catch(() => {});
    return null;
  }, [patientId]);
  // #endregion
  const { data: vitals, isLoading } = useQuery({
    queryKey: ["vitals", patientId],
    queryFn: async () => {
      // #region debug-point C:portal-vitals-fetch
      fetch("http://127.0.0.1:7777/event", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "vitals-realtime-sync",
          runId: "pre-fix",
          hypothesisId: "C",
          location: "health-snapshot:queryFn",
          msg: "[DEBUG] Portal health snapshot fetching vitals",
          data: { patientId },
          ts: Date.now()
        })
      }).catch(() => {});
      // #endregion
      return patientService.getVitals(patientId);
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: ({ vitalSignId, note }: { vitalSignId: number; note: string }) =>
      patientService.acknowledgeVitalSign(patientId, vitalSignId, note),
    onSuccess: () => {
      toast.success("تایید مشاهده هشدار ثبت شد.");
      setAckNote("");
      void queryClient.invalidateQueries({ queryKey: ["vitals", patientId] });
    },
    onError: (error) => {
      console.error("Acknowledge vital sign failed", error);
      toast.error(getVitalAcknowledgementErrorMessage(error), { duration: 7000 });
    },
  });

  const sortedVitals = useMemo(
    () => (vitals ? [...vitals].sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()) : []),
    [vitals]
  );

  const latestVital = sortedVitals[0] ?? null;
  const latestAlerts = useMemo(
    () => (sortedVitals.length > 0 ? evaluateVitalAlerts(sortedVitals.slice(0, 3)) : []),
    [sortedVitals]
  );
  const latestAlertKey = useMemo(
    () => (latestVital && latestAlerts.length > 0 ? `${latestVital.id}:${latestAlerts.map((alert) => `${alert.code}-${alert.severity}`).join("|")}` : ""),
    [latestAlerts, latestVital]
  );
  const latestStatusMeta = getVitalStatusMeta(getVitalDisplayStatus(latestAlerts));
  const acknowledgementPending = Boolean(latestVital && latestAlerts.length > 0 && !latestVital.patientAcknowledgedAt);
  const normalizedAcknowledgementNote = normalizePatientAcknowledgementNote(latestVital?.patientAcknowledgementNote);
  const filterAlerts = (predicate: (alert: VitalSignAlert) => boolean) => latestAlerts.filter(predicate);
  const getTrendLabel = (alerts: VitalSignAlert[], fallback: string) => {
    if (alerts.some((alert) => alert.severity === "Critical")) return "خطرناک";
    if (alerts.length > 0) return "غیرنرمال";
    return fallback;
  };

  const bloodPressureAlerts = filterAlerts((alert) => ["SBP", "DBP", "MAP"].some((code) => alert.code.startsWith(code)));
  const pulseAlerts = filterAlerts((alert) => alert.code.startsWith("PR") || alert.code.startsWith("PULSE"));
  const oxygenAlerts = filterAlerts((alert) => alert.code.startsWith("SPO2"));
  const temperatureAlerts = filterAlerts((alert) => alert.code.startsWith("TEMP"));
  const bloodSugarEvaluation = evaluateBloodSugar(latestVital?.bloodSugar, latestVital?.bloodSugarMeasurementType);
  const lastUpdate = latestVital
    ? formatDistanceToNow(new Date(latestVital.recordedAt), { addSuffix: true, locale: faIR })
    : "نامشخص";
  const showInlineAlert = Boolean(latestAlertKey) && dismissedAlertKey !== latestAlertKey;

  const handleDismissAlert = () => {
    if (!latestAlertKey || typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(`portal-vital-alert-dismissed:${patientId}`, latestAlertKey);
    setDismissedAlertKey(latestAlertKey);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 mb-8 relative z-1">
        <div className="flex items-center justify-between px-2">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 md:h-40 bg-gray-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8 relative z-1">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-base md:text-lg font-bold text-gray-800">وضعیت سلامت شما</h2>
        <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-400">
          <RefreshCw className="w-3 h-3" />
          <span>بروزرسانی: {lastUpdate}</span>
        </div>
      </div>

      {showInlineAlert && latestVital && latestAlerts.length > 0 && (
        <PortalCard className={`relative border ${latestStatusMeta.cardClassName}`}>
          <button
            type="button"
            onClick={handleDismissAlert}
            aria-label="پنهان کردن هشدار"
            className="absolute left-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/95 text-gray-500 shadow-sm transition hover:text-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="space-y-4 p-4 sm:p-5">
            <div className="flex items-start gap-3 pl-10 sm:pl-12">
              <AlertTriangle className={`mt-0.5 h-5 w-5 ${latestStatusMeta.accentClassName}`} />
              <div className="space-y-1">
                <div className="font-bold text-gray-900">
                  وضعیت آخرین ثبت علائم حیاتی: {latestStatusMeta.label}
                </div>
                <div className="text-sm text-gray-700">
                  {latestAlerts.map((alert) => alert.message).join("، ")}
                </div>
                <div className="text-xs text-gray-500">
                  اگر این هشدار را دیده‌اید، لطفا اقدام انجام‌شده را ثبت کنید. بعداً هم از بخش اعلان‌ها در زنگوله قابل مشاهده است.
                </div>
              </div>
            </div>

            {acknowledgementPending ? (
              <div className="space-y-3 rounded-2xl bg-white/70 p-3">
                <textarea
                  value={ackNote}
                  onChange={(event) => setAckNote(event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100"
                  placeholder="مثلا با پرستار تماس گرفتم، استراحت کردم یا اکسیژن را بررسی کردم."
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-gray-500">اقدام انجام‌شده را کوتاه و شفاف ثبت کنید.</span>
                  <button
                    type="button"
                    onClick={() => latestVital && acknowledgeMutation.mutate({ vitalSignId: latestVital.id, note: ackNote })}
                    disabled={ackNote.trim().length === 0 || acknowledgeMutation.isPending}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-medical-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-medical-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {acknowledgeMutation.isPending ? "در حال ثبت..." : "تایید مشاهده و ثبت اقدام"}
                  </button>
                </div>
              </div>
            ) : normalizedAcknowledgementNote ? (
              <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div className="space-y-1 text-sm text-gray-700">
                  <div className="font-bold text-gray-900">تایید مشاهده ثبت شده است</div>
                  <div>{normalizedAcknowledgementNote}</div>
                  <div className="text-xs text-gray-500">
                    {latestVital.patientAcknowledgedByName ? `ثبت توسط ${latestVital.patientAcknowledgedByName}` : "ثبت توسط بیمار"}
                    {latestVital.patientAcknowledgedAt
                      ? ` در ${new Date(latestVital.patientAcknowledgedAt).toLocaleString("fa-IR")}`
                      : ""}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </PortalCard>
      )}
      
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <VitalCard 
          title="فشار خون" 
          value={latestVital ? `${latestVital.systolicBloodPressure}/${latestVital.diastolicBloodPressure}` : "--/--"} 
          unit="mmHg" 
          icon={Activity} 
          color="bg-blue-500" 
          statusClassName={getVitalStatusMeta(getVitalDisplayStatus(bloodPressureAlerts)).badgeClassName}
          trend={getTrendLabel(bloodPressureAlerts, "نرمال")}
          data={getChartData(sortedVitals, "systolicBloodPressure")}
        />
        <VitalCard 
          title="ضربان قلب" 
          value={latestVital ? latestVital.pulseRate : "--"} 
          unit="bpm" 
          icon={Heart} 
          color="bg-rose-500" 
          statusClassName={getVitalStatusMeta(getVitalDisplayStatus(pulseAlerts)).badgeClassName}
          trend={getTrendLabel(pulseAlerts, "نرمال")}
          data={getChartData(sortedVitals, "pulseRate")}
        />
        <VitalCard 
          title="اکسیژن خون" 
          value={latestVital ? latestVital.oxygenSaturation : "--"} 
          unit="%" 
          icon={Droplet} 
          color="bg-sky-500" 
          statusClassName={getVitalStatusMeta(getVitalDisplayStatus(oxygenAlerts)).badgeClassName}
          trend={getTrendLabel(oxygenAlerts, "نرمال")}
          data={getChartData(sortedVitals, "oxygenSaturation")}
        />
        <VitalCard 
          title="دما" 
          value={latestVital ? latestVital.bodyTemperature : "--"} 
          unit="°C" 
          icon={Thermometer} 
          color="bg-orange-500" 
          statusClassName={getVitalStatusMeta(getVitalDisplayStatus(temperatureAlerts)).badgeClassName}
          trend={getTrendLabel(temperatureAlerts, "نرمال")}
          data={getChartData(sortedVitals, "bodyTemperature")}
        />
        <VitalCard 
          title="قند خون" 
          value={latestVital?.bloodSugar == null ? "ثبت نشده" : latestVital.bloodSugar} 
          unit="mg/dL" 
          icon={Droplet} 
          color="bg-amber-500" 
          subtitle={bloodSugarEvaluation?.measurementLabel}
          statusClassName={latestVital?.bloodSugar == null ? "bg-gray-100 text-gray-500 border-gray-200" : bloodSugarEvaluation?.statusMeta.badgeClassName ?? "bg-gray-100 text-gray-500 border-gray-200"}
          trend={latestVital?.bloodSugar == null ? "ثبت نشده" : bloodSugarEvaluation?.statusMeta.label ?? "ثبت شده"}
          data={getChartData(sortedVitals, "bloodSugar")}
        />
      </div>
    </div>
  );
}

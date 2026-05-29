"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { patientService } from "@/services/patient.service";
import { PortalCard } from "./ui/portal-card";
import { PortalButton } from "./ui/portal-button";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Activity, Thermometer, Droplet, Heart, Clock, User, FileText, Calendar, Search, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { VitalHistoryNote } from "@/components/vitals/vital-history-note";
import { getVitalAlertsForHistory, getVitalDisplayStatus, getVitalStatusMeta } from "@/utils/vital-alerts";
import { getVitalAcknowledgementErrorMessage } from "@/utils/vital-acknowledgement";
import { toast } from "react-hot-toast";

interface VitalSignsHistoryProps {
  patientId: number;
  highlightedVitalId?: number | null;
}

const DEFAULT_VISIBLE_COUNT = 3;

function getLocalDateValue(dateString: string | Date) {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function VitalSignsHistory({ patientId, highlightedVitalId = null }: VitalSignsHistoryProps) {
  const queryClient = useQueryClient();
  const [ackNote, setAckNote] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_COUNT);
  const { data: vitals, isLoading } = useQuery({
    queryKey: ["vitals", patientId],
    queryFn: () => patientService.getVitals(patientId),
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
    () => (
      vitals
        ? [...vitals].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
        : []
    ),
    [vitals]
  );

  const filteredVitals = useMemo(() => {
    return sortedVitals.filter((vital) => {
      const vitalDate = getLocalDateValue(vital.recordedAt);
      if (selectedDate && vitalDate !== selectedDate) {
        return false;
      }

      return true;
    });
  }, [selectedDate, sortedVitals]);

  const highlightedIndex = filteredVitals.findIndex((vital) => vital.id === highlightedVitalId);
  const effectiveVisibleCount = highlightedIndex >= 0
    ? Math.max(visibleCount, highlightedIndex + 1)
    : visibleCount;
  const visibleVitals = filteredVitals.slice(0, effectiveVisibleCount);
  const hasMoreVitals = effectiveVisibleCount < filteredVitals.length;
  const hasDateFilter = Boolean(selectedDate);

  useEffect(() => {
    if (!highlightedVitalId || filteredVitals.length === 0 || highlightedIndex < 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const targetId = window.innerWidth >= 768
        ? `portal-vital-desktop-${highlightedVitalId}`
        : `portal-vital-mobile-${highlightedVitalId}`;
      const target = document.getElementById(targetId);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [filteredVitals.length, highlightedIndex, highlightedVitalId]);

  if (isLoading) {
    return (
      <PortalCard className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </PortalCard>
    );
  }

  if (!vitals || vitals.length === 0) {
    return null;
  }

  const clearDateFilters = () => {
    setSelectedDate("");
    setVisibleCount(DEFAULT_VISIBLE_COUNT);
  };

  const selectedDateLabel = selectedDate
    ? new DateObject({ date: new Date(selectedDate), calendar: persian, locale: persian_fa }).format("YYYY/MM/DD")
    : "";

  return (
    <PortalCard className="overflow-hidden h-full flex flex-col">
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="flex flex-col gap-4 p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 text-base font-bold text-gray-800 md:text-lg">
                <FileText className="text-medical-600" size={20} />
                تاریخچه علائم حیاتی
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                پیش‌فرض فقط ۳ ثبت آخر نمایش داده می‌شود.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                {filteredVitals.length} از {vitals.length} رکورد
              </span>
              {hasDateFilter && (
                <span className="rounded-full bg-medical-50 px-2.5 py-1 text-xs text-medical-700">
                  {selectedDateLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <PortalButton
              type="button"
              variant={isFilterVisible || hasDateFilter ? "secondary" : "outline"}
              size="md"
              onClick={() => setIsFilterVisible((current) => !current)}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                جستجوی علائم حیاتی براساس روز
              </span>
              {isFilterVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </PortalButton>

            {isFilterVisible && (
              <div className="rounded-3xl border border-gray-100 bg-gray-50/80 p-3 sm:p-4">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
                  <label className="space-y-1">
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-600">
                      <Calendar className="h-3.5 w-3.5" />
                      انتخاب روز
                    </span>
                    <DatePicker
                      value={selectedDate ? new Date(selectedDate) : ""}
                      onChange={(date: { isValid?: boolean; toDate?: () => Date } | null) => {
                        if (!date || !date.isValid || !date.toDate) {
                          setSelectedDate("");
                          setVisibleCount(DEFAULT_VISIBLE_COUNT);
                          return;
                        }

                        setSelectedDate(getLocalDateValue(date.toDate()));
                        setVisibleCount(DEFAULT_VISIBLE_COUNT);
                      }}
                      calendar={persian}
                      locale={persian_fa}
                      format="YYYY/MM/DD"
                      calendarPosition="bottom-right"
                      inputClass="h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-medical-400 focus:ring-4 focus:ring-medical-100"
                      containerClassName="w-full"
                      placeholder="یک روز را انتخاب کنید"
                    />
                  </label>

                  <PortalButton
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={clearDateFilters}
                    disabled={!hasDateFilter}
                    className="w-full lg:self-end lg:w-auto"
                  >
                    پاک کردن فیلتر
                  </PortalButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredVitals.length === 0 && (
        <div className="p-4 md:p-6">
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/80 p-6 text-center">
            <div className="text-sm font-medium text-gray-700">علائمی برای روز انتخاب‌شده پیدا نشد.</div>
            <div className="mt-1 text-xs text-gray-500">یک روز دیگر را انتخاب کنید یا فیلتر را پاک کنید.</div>
          </div>
        </div>
      )}

      {/* Mobile View (Cards) */}
      {filteredVitals.length > 0 && (
      <div className="md:hidden divide-y divide-gray-100">
        {visibleVitals.map((vital, index) => {
          const alerts = getVitalAlertsForHistory(filteredVitals, index);
          const statusMeta = getVitalStatusMeta(getVitalDisplayStatus(alerts));
          const isHighlighted = highlightedVitalId === vital.id;
          const canAcknowledge = isHighlighted && alerts.length > 0 && !vital.patientAcknowledgedAt;

          return (
          <div
            key={vital.id}
            id={`portal-vital-mobile-${vital.id}`}
            className={cn(
              "p-4 space-y-3 transition-colors",
              isHighlighted ? "bg-medical-50/70 ring-1 ring-medical-100" : "hover:bg-gray-50/50"
            )}
          >
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-medical-500" />
                {new DateObject({ date: new Date(vital.recordedAt), calendar: persian, locale: persian_fa }).format("YYYY/MM/DD")}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-medical-500" />
                {new DateObject({ date: new Date(vital.recordedAt), calendar: persian, locale: persian_fa }).format("HH:mm")}
              </div>
            </div>

            <div className="flex justify-start">
              <span className={cn("rounded-full border px-2 py-1 text-[10px] font-bold", statusMeta.badgeClassName)}>
                {statusMeta.label}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50">
                <Activity size={18} className="text-blue-500" />
                <div>
                  <span className="block text-sm font-bold text-gray-800 leading-none mb-1">
                    {vital.systolicBloodPressure}/{vital.diastolicBloodPressure}
                  </span>
                  <span className="text-[10px] text-gray-500">فشار خون</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50/50">
                <Heart size={18} className="text-rose-500" />
                <div>
                  <span className="block text-sm font-bold text-gray-800 leading-none mb-1">
                    {vital.pulseRate}
                  </span>
                  <span className="text-[10px] text-gray-500">ضربان</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50/50">
                <Thermometer size={18} className="text-orange-500" />
                <div>
                  <span className="block text-sm font-bold text-gray-800 leading-none mb-1">
                    {vital.bodyTemperature}
                  </span>
                  <span className="text-[10px] text-gray-500">دما</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-sky-50/50">
                <Droplet size={18} className="text-sky-500" />
                <div>
                  <span className="block text-sm font-bold text-gray-800 leading-none mb-1">
                    {vital.oxygenSaturation}
                  </span>
                  <span className="text-[10px] text-gray-500">اکسیژن</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 pt-1 border-t border-gray-50 mt-2">
              <User size={12} />
              <span>ثبت کننده: {vital.recorderName}</span>
            </div>

            <VitalHistoryNote
              alerts={alerts}
              patientAcknowledgementNote={vital.patientAcknowledgementNote}
              patientAcknowledgedAt={vital.patientAcknowledgedAt}
              patientAcknowledgedByName={vital.patientAcknowledgedByName}
              className="mt-0"
            />
            {canAcknowledge && (
              <div className="space-y-3 rounded-2xl border border-medical-100 bg-white/90 p-3">
                <div className="text-xs font-medium text-medical-700">برای همین ثبت می‌توانید اقدام انجام‌شده را ثبت کنید.</div>
                <textarea
                  value={ackNote}
                  onChange={(event) => setAckNote(event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100"
                  placeholder="مثلا با پرستار تماس گرفتم، استراحت کردم یا اکسیژن را بررسی کردم."
                />
                <button
                  type="button"
                  onClick={() => acknowledgeMutation.mutate({ vitalSignId: vital.id, note: ackNote })}
                  disabled={ackNote.trim().length === 0 || acknowledgeMutation.isPending}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-medical-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-medical-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {acknowledgeMutation.isPending ? "در حال ثبت..." : "تایید مشاهده و ثبت اقدام"}
                </button>
              </div>
            )}
          </div>
        )})}
      </div>
      )}

      {/* Desktop View (Table) */}
      {filteredVitals.length > 0 && (
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-500 sticky top-0">
            <tr>
              <th className="px-6 py-4 font-medium whitespace-nowrap">تاریخ و زمان</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">فشار خون</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">ضربان قلب</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">دما</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">اکسیژن</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">ثبت کننده</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">وضعیت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visibleVitals.map((vital, index) => {
              const alerts = getVitalAlertsForHistory(filteredVitals, index);
              const statusMeta = getVitalStatusMeta(getVitalDisplayStatus(alerts));
              const isHighlighted = highlightedVitalId === vital.id;
              const canAcknowledge = isHighlighted && alerts.length > 0 && !vital.patientAcknowledgedAt;

              return (
              <Fragment key={vital.id}>
              <tr
                id={`portal-vital-desktop-${vital.id}`}
                key={vital.id}
                className={cn(
                  "transition-colors group",
                  isHighlighted ? "bg-medical-50/70" : "hover:bg-gray-50/50"
                )}
              >
                <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    {new DateObject({ date: new Date(vital.recordedAt), calendar: persian, locale: persian_fa }).format("YYYY/MM/DD HH:mm")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-blue-500" />
                    <span className="font-bold text-gray-800">
                      {vital.systolicBloodPressure}/{vital.diastolicBloodPressure}
                    </span>
                    <span className="text-xs text-gray-400">mmHg</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-rose-500" />
                    <span className="font-bold text-gray-800">{vital.pulseRate}</span>
                    <span className="text-xs text-gray-400">bpm</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Thermometer size={16} className="text-orange-500" />
                    <span className="font-bold text-gray-800">{vital.bodyTemperature}</span>
                    <span className="text-xs text-gray-400">°C</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Droplet size={16} className="text-sky-500" />
                    <span className="font-bold text-gray-800">{vital.oxygenSaturation}</span>
                    <span className="text-xs text-gray-400">%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-gray-500">
                    <User size={14} />
                    <span>{vital.recorderName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn("rounded-full border px-2 py-1 text-xs font-bold", statusMeta.badgeClassName)}>
                    {statusMeta.label}
                  </span>
                </td>
              </tr>
              {(alerts.length > 0 || vital.patientAcknowledgementNote || canAcknowledge) && (
              <tr key={`${vital.id}-note`} className="bg-gray-50/50">
                <td colSpan={7} className="px-6 pb-4 pt-0">
                  <VitalHistoryNote
                    alerts={alerts}
                    patientAcknowledgementNote={vital.patientAcknowledgementNote}
                    patientAcknowledgedAt={vital.patientAcknowledgedAt}
                    patientAcknowledgedByName={vital.patientAcknowledgedByName}
                    className="mt-0"
                  />
                  {canAcknowledge && (
                    <div className="mt-3 space-y-3 rounded-2xl border border-medical-100 bg-white p-3">
                      <div className="text-xs font-medium text-medical-700">برای همین ثبت می‌توانید اقدام انجام‌شده را ثبت کنید.</div>
                      <textarea
                        value={ackNote}
                        onChange={(event) => setAckNote(event.target.value)}
                        rows={3}
                        className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100"
                        placeholder="مثلا با پرستار تماس گرفتم، استراحت کردم یا اکسیژن را بررسی کردم."
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => acknowledgeMutation.mutate({ vitalSignId: vital.id, note: ackNote })}
                          disabled={ackNote.trim().length === 0 || acknowledgeMutation.isPending}
                          className="inline-flex items-center justify-center rounded-xl bg-medical-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-medical-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {acknowledgeMutation.isPending ? "در حال ثبت..." : "تایید مشاهده و ثبت اقدام"}
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
              )}
              </Fragment>
            )})}
          </tbody>
        </table>
      </div>
      )}

      {hasMoreVitals && (
        <div className="border-t border-gray-100 p-4 md:p-6">
          <PortalButton
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setVisibleCount((current) => current + DEFAULT_VISIBLE_COUNT)}
            className="w-full"
          >
            نمایش بیشتر
          </PortalButton>
        </div>
      )}
    </PortalCard>
  );
}

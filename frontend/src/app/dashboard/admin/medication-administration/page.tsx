"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, BarChart2, ClipboardCheck, Clock3, Pill, RefreshCcw } from "lucide-react";
import { addDays, format } from "date-fns";
import {
  useAdministrationOverviewReport,
  useAdministrationTrendReport,
} from "@/features/medications/hooks/useKardex";
import {
  MedicationAdministrationReportFilters,
  ShiftSlot,
} from "@/types/medication";
import {
  getMedicationDoseStatusPresentation,
  getShiftSlotLabel,
} from "@/features/medications/lib/administration-ui";

export default function MedicationAdministrationPage() {
  const [from, setFrom] = useState(format(addDays(new Date(), -6), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [patientId, setPatientId] = useState("");
  const [medicationId, setMedicationId] = useState("");
  const [shiftSlot, setShiftSlot] = useState<string>("");
  const [recordedByUserId, setRecordedByUserId] = useState("");

  const filters = useMemo<MedicationAdministrationReportFilters>(() => ({
    from,
    to,
    patientId: patientId ? Number(patientId) : undefined,
    medicationId: medicationId ? Number(medicationId) : undefined,
    shiftSlot: shiftSlot ? Number(shiftSlot) as ShiftSlot : undefined,
    recordedByUserId: recordedByUserId || undefined,
  }), [from, to, patientId, medicationId, shiftSlot, recordedByUserId]);

  const { data: overview, isLoading: isLoadingOverview } = useAdministrationOverviewReport(filters);
  const { data: trend, isLoading: isLoadingTrend } = useAdministrationTrendReport(filters);

  const maxTrendValue = Math.max(
    1,
    ...(trend ?? []).map((item) => item.takenCount + item.lateCount + item.missedCount + item.skippedCount)
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">پایش مصرف دارو</h1>
            <p className="mt-1 text-sm text-gray-500">
              گزارش سراسری ثبت مصرف دارو، پایبندی بیماران، missed trend و ردیف‌های عملیاتی.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
            <input value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="شناسه بیمار" className="rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
            <input value={medicationId} onChange={(e) => setMedicationId(e.target.value)} placeholder="شناسه دارو" className="rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
            <select value={shiftSlot} onChange={(e) => setShiftSlot(e.target.value)} className="rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500">
              <option value="">همه شیفت‌ها</option>
              <option value={ShiftSlot.Morning}>صبح</option>
              <option value={ShiftSlot.Evening}>عصر</option>
              <option value={ShiftSlot.Night}>شب</option>
            </select>
            <input value={recordedByUserId} onChange={(e) => setRecordedByUserId(e.target.value)} placeholder="شناسه پرستار/ثبت‌کننده" className="rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="کل نوبت‌ها" value={overview?.totalDoses ?? 0} icon={<Pill className="h-5 w-5" />} tone="slate" isLoading={isLoadingOverview} />
        <MetricCard title="پایبندی دارویی" value={`${overview?.adherenceRate ?? 0}%`} icon={<ClipboardCheck className="h-5 w-5" />} tone="emerald" isLoading={isLoadingOverview} />
        <MetricCard title="مصرف با تأخیر" value={overview?.lateCount ?? 0} icon={<Clock3 className="h-5 w-5" />} tone="amber" isLoading={isLoadingOverview} />
        <MetricCard title="مصرف‌نشده" value={overview?.missedCount ?? 0} icon={<AlertTriangle className="h-5 w-5" />} tone="rose" isLoading={isLoadingOverview} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-5 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">روند مصرف در بازه</h2>
          </div>
          {isLoadingTrend ? (
            <div className="py-10 text-center text-gray-500">در حال آماده‌سازی نمودار...</div>
          ) : !trend?.length ? (
            <div className="py-10 text-center text-gray-500">داده‌ای برای این بازه وجود ندارد.</div>
          ) : (
            <div className="space-y-4">
              {trend.map((item) => {
                const total = item.takenCount + item.lateCount + item.missedCount + item.skippedCount;
                const width = `${(total / maxTrendValue) * 100}%`;

                return (
                  <div key={item.date} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{new Date(item.date).toLocaleDateString("fa-IR")}</span>
                      <span>{total} نوبت</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" style={{ width }} />
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>مصرف‌شده: {item.takenCount}</span>
                      <span>با تأخیر: {item.lateCount}</span>
                      <span>مصرف‌نشده: {item.missedCount}</span>
                      <span>عدم مصرف: {item.skippedCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="mb-4 text-lg font-bold text-gray-900">بیماران با وضعیت پایبندی</h2>
            <div className="space-y-3">
              {overview?.patients?.length ? overview.patients.map((item) => (
                <Link
                  key={item.careRecipientId}
                  href={`/dashboard/patients/${item.careRecipientId}?tab=medications`}
                  className="block rounded-2xl border border-gray-100 p-4 transition hover:border-teal-200 hover:bg-teal-50/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-gray-900">{item.patientName}</div>
                      <div className="mt-1 text-sm text-gray-500">کل نوبت: {item.totalDoses} - Missed: {item.missedCount}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                      {item.adherenceRate}%
                    </div>
                  </div>
                </Link>
              )) : <div className="text-sm text-gray-500">داده‌ای یافت نشد.</div>}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="mb-4 text-lg font-bold text-gray-900">داروهای پرتکرار فراموش‌شده</h2>
            <div className="space-y-3">
              {overview?.mostMissedMedications?.length ? overview.mostMissedMedications.map((item) => (
                <div key={`${item.medicationId}-${item.medicationName}`} className="flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3 text-sm">
                  <span className="font-medium text-rose-900">{item.medicationName}</span>
                  <span className="font-bold text-rose-700">{item.missedCount} بار</span>
                </div>
              )) : <div className="text-sm text-gray-500">داروی missed پرتکراری ثبت نشده است.</div>}
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">ردیف‌های عملیاتی</h2>
            <p className="mt-1 text-sm text-gray-500">آخرین نوبت‌های دارویی فیلترشده همراه با وضعیت و لینک به پرونده بیمار.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFrom(format(addDays(new Date(), -6), "yyyy-MM-dd"));
              setTo(format(new Date(), "yyyy-MM-dd"));
              setPatientId("");
              setMedicationId("");
              setShiftSlot("");
              setRecordedByUserId("");
            }}
            className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700"
          >
            <RefreshCcw className="h-4 w-4" />
            بازنشانی فیلتر
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="text-right text-gray-500">
                <th className="px-4 py-3">بیمار</th>
                <th className="px-4 py-3">دارو</th>
                <th className="px-4 py-3">زمان</th>
                <th className="px-4 py-3">شیفت</th>
                <th className="px-4 py-3">وضعیت</th>
                <th className="px-4 py-3">ثبت‌کننده</th>
                <th className="px-4 py-3">پرونده</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {overview?.rows?.length ? overview.rows.map((row) => {
                const presentation = getMedicationDoseStatusPresentation({
                  ...row,
                  route: "",
                  dosage: "",
                  instructions: "",
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

                return (
                  <tr key={row.doseId}>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.patientName}</td>
                    <td className="px-4 py-3 text-gray-700">{row.medicationName}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(row.scheduledTime).toLocaleString("fa-IR")}</td>
                    <td className="px-4 py-3 text-gray-500">{getShiftSlotLabel(row.scheduledShiftSlot)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${presentation.className}`}>{presentation.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{row.recordedByName || row.verifiedByName || "-"}</td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/patients/${row.careRecipientId}?tab=medications&doseId=${row.doseId}`} className="text-teal-600 hover:text-teal-700 font-bold">
                        مشاهده
                      </Link>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">ردیفی برای نمایش وجود ندارد.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  tone,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  tone: "slate" | "emerald" | "amber" | "rose";
  isLoading?: boolean;
}) {
  const toneClass = {
    slate: "bg-slate-50 text-slate-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  }[tone];

  return (
    <div className={`rounded-3xl p-5 shadow-sm border border-gray-100 ${toneClass}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{title}</div>
        <div>{icon}</div>
      </div>
      <div className="mt-4 text-3xl font-black">{isLoading ? "..." : value}</div>
    </div>
  );
}

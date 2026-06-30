"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, BarChart2, ClipboardCheck, Clock3, Download, Filter, Pill, Printer, RefreshCcw, Settings, ShieldCheck, Users } from "lucide-react";
import { addDays } from "date-fns";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  useAdministrationOverviewReport,
  useAdministrationTrendReport,
  useAdministrationAdherenceBreakdownReport,
  useAdministrationStaffPerformanceReport,
} from "@/features/medications/hooks/useKardex";
import {
  MedicationAdministrationReportFilters,
  MedicationAdministrationReportRow,
  MedicationAdministrationOutcome,
  MedicationTimingStatus,
  MedicationVerificationStatus,
  ShiftSlot,
} from "@/types/medication";
import {
  getMedicationDoseStatusPresentation,
  getShiftSlotLabel,
} from "@/features/medications/lib/administration-ui";
import { formatTehranDateValue } from "@/lib/tehran-date";
import { MedicationDoseManagementDialog } from "@/features/medications/components/admin/MedicationDoseManagementDialog";
import { downloadMedicationAdministrationCsv, openMedicationAdministrationPrintView } from "@/features/medications/lib/medication-administration-export";

export default function MedicationAdministrationPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "rows" | "adherence" | "settings">("dashboard");
  const [from, setFrom] = useState(formatTehranDateValue(addDays(new Date(), -6)));
  const [to, setTo] = useState(formatTehranDateValue(new Date()));
  const [patientId, setPatientId] = useState("");
  const [medicationId, setMedicationId] = useState("");
  const [shiftSlot, setShiftSlot] = useState<string>("");
  const [recordedByUserId, setRecordedByUserId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "issues" | "pending" | "late" | "missed">("issues");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [selectedRow, setSelectedRow] = useState<MedicationAdministrationReportRow | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);

  const filters = useMemo<MedicationAdministrationReportFilters>(() => ({
    from,
    to,
    patientId: patientId ? Number(patientId) : undefined,
    medicationId: medicationId ? Number(medicationId) : undefined,
    shiftSlot: shiftSlot ? Number(shiftSlot) as ShiftSlot : undefined,
    recordedByUserId: recordedByUserId || undefined,
    search: search.trim() || undefined,
  }), [from, to, patientId, medicationId, shiftSlot, recordedByUserId, search]);

  const { data: overview, isLoading: isLoadingOverview } = useAdministrationOverviewReport(filters);
  const { data: trend, isLoading: isLoadingTrend } = useAdministrationTrendReport(filters);
  const { data: adherenceBreakdown, isLoading: isLoadingAdherence } = useAdministrationAdherenceBreakdownReport(filters);
  const { data: staffPerformance, isLoading: isLoadingStaff } = useAdministrationStaffPerformanceReport(filters);

  const maxTrendValue = Math.max(
    1,
    ...(trend ?? []).map((item) => item.takenCount + item.lateCount + item.missedCount + item.skippedCount)
  );

  const visibleRows = useMemo(() => {
    const rows = overview?.rows ?? [];

    if (statusFilter === "all") {
      return rows;
    }

    if (statusFilter === "pending") {
      return rows.filter((row) => row.verificationStatus === MedicationVerificationStatus.Pending);
    }

    if (statusFilter === "late") {
      return rows.filter((row) => row.timingStatus === MedicationTimingStatus.Late);
    }

    if (statusFilter === "missed") {
      return rows.filter((row) => row.administrationOutcome === MedicationAdministrationOutcome.Missed);
    }

    return rows.filter((row) =>
      row.verificationStatus === MedicationVerificationStatus.Pending ||
      row.timingStatus === MedicationTimingStatus.Late ||
      row.administrationOutcome === MedicationAdministrationOutcome.Missed
    );
  }, [overview?.rows, statusFilter]);

  const resetFilters = () => {
    setFrom(formatTehranDateValue(addDays(new Date(), -6)));
    setTo(formatTehranDateValue(new Date()));
    setPatientId("");
    setMedicationId("");
    setShiftSlot("");
    setRecordedByUserId("");
    setSearch("");
    setStatusFilter("issues");
  };

  const openManage = (row: MedicationAdministrationReportRow) => {
    setSelectedRow(row);
    setIsManageOpen(true);
  };

  const exportCsv = () => {
    const rows = visibleRows;
    if (!rows.length) {
      return;
    }

    downloadMedicationAdministrationCsv(rows, `medication-administration_${from}_to_${to}.csv`);
  };

  const exportPrint = () => {
    const rows = visibleRows;
    if (!rows.length) {
      return;
    }

    const subtitleParts: string[] = [];
    subtitleParts.push(`از ${from} تا ${to}`);
    if (filters.shiftSlot) subtitleParts.push(`شیفت: ${getShiftSlotLabel(filters.shiftSlot)}`);
    if (filters.search) subtitleParts.push(`جستجو: ${filters.search}`);
    openMedicationAdministrationPrintView("پایش مصرف دارو (گزارش)", subtitleParts.join(" | "), rows);
  };

  const parseIsoDateMidday = (value: string) => new Date(`${value}T12:00:00`);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-teal-600" />
              <h1 className="text-2xl font-black text-gray-900">پایش مصرف دارو</h1>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              داشبورد مدیریتی برای مشاهده سراسری، تأیید/رد ثبت‌ها، اصلاح مدیریتی، گزارش پایبندی و خروجی‌گیری.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setIsFiltersOpen((v) => !v)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <Filter className="h-4 w-4" />
              فیلترها
            </button>

            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              disabled={!visibleRows.length}
            >
              <Download className="h-4 w-4" />
              Excel (CSV)
            </button>

            <button
              type="button"
              onClick={exportPrint}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
              disabled={!visibleRows.length}
            >
              <Printer className="h-4 w-4" />
              PDF/چاپ
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
          <TabButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon={<BarChart2 className="h-4 w-4" />}>
            داشبورد
          </TabButton>
          <TabButton active={activeTab === "rows"} onClick={() => setActiveTab("rows")} icon={<ClipboardCheck className="h-4 w-4" />}>
            ردیف‌های عملیاتی
          </TabButton>
          <TabButton active={activeTab === "adherence"} onClick={() => setActiveTab("adherence")} icon={<Pill className="h-4 w-4" />}>
            پایبندی (تفکیک دارو)
          </TabButton>
          <TabButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon={<Settings className="h-4 w-4" />}>
            تنظیمات
          </TabButton>
        </div>

        {isFiltersOpen ? (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="grid gap-3 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <label className="mb-1 block text-xs font-bold text-slate-600">از تاریخ</label>
                <DatePicker
                  value={from ? parseIsoDateMidday(from) : undefined}
                  onChange={(date: any) => {
                    if (date && date.isValid) {
                      setFrom(formatTehranDateValue(date.toDate()));
                    }
                  }}
                  calendar={persian}
                  locale={persian_fa}
                  calendarPosition="bottom-right"
                  inputClass="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                  containerStyle={{ width: "100%" }}
                />
              </div>

              <div className="lg:col-span-3">
                <label className="mb-1 block text-xs font-bold text-slate-600">تا تاریخ</label>
                <DatePicker
                  value={to ? parseIsoDateMidday(to) : undefined}
                  onChange={(date: any) => {
                    if (date && date.isValid) {
                      setTo(formatTehranDateValue(date.toDate()));
                    }
                  }}
                  calendar={persian}
                  locale={persian_fa}
                  calendarPosition="bottom-right"
                  inputClass="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                  containerStyle={{ width: "100%" }}
                />
              </div>

              <div className="lg:col-span-4">
                <label className="mb-1 block text-xs font-bold text-slate-600">جستجو (بیمار/دارو/پرستار/یادداشت)</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="مثلاً: محمدی، آملودیپین، ناصری..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-1 block text-xs font-bold text-slate-600">شیفت</label>
                <select
                  value={shiftSlot}
                  onChange={(e) => setShiftSlot(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                >
                  <option value="">همه</option>
                  <option value={ShiftSlot.Morning}>صبح</option>
                  <option value={ShiftSlot.Evening}>عصر</option>
                  <option value={ShiftSlot.Night}>شب</option>
                </select>
              </div>

              <div className="lg:col-span-4">
                <label className="mb-1 block text-xs font-bold text-slate-600">شناسه بیمار (اختیاری)</label>
                <input
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="مثلاً 12"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                  inputMode="numeric"
                />
              </div>

              <div className="lg:col-span-4">
                <label className="mb-1 block text-xs font-bold text-slate-600">شناسه دارو (اختیاری)</label>
                <input
                  value={medicationId}
                  onChange={(e) => setMedicationId(e.target.value)}
                  placeholder="مثلاً 54"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                  inputMode="numeric"
                />
              </div>

              <div className="lg:col-span-4">
                <label className="mb-1 block text-xs font-bold text-slate-600">شناسه ثبت‌کننده (اختیاری)</label>
                <input
                  value={recordedByUserId}
                  onChange={(e) => setRecordedByUserId(e.target.value)}
                  placeholder="UserId"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <StatusChip active={statusFilter === "issues"} onClick={() => setStatusFilter("issues")}>نیازمند پیگیری</StatusChip>
                <StatusChip active={statusFilter === "pending"} onClick={() => setStatusFilter("pending")}>در انتظار تأیید</StatusChip>
                <StatusChip active={statusFilter === "late"} onClick={() => setStatusFilter("late")}>با تأخیر</StatusChip>
                <StatusChip active={statusFilter === "missed"} onClick={() => setStatusFilter("missed")}>مصرف‌نشده</StatusChip>
                <StatusChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>همه</StatusChip>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 border border-slate-200 hover:bg-slate-50"
              >
                <RefreshCcw className="h-4 w-4" />
                بازنشانی
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="کل نوبت‌ها" value={overview?.totalDoses ?? 0} icon={<Pill className="h-5 w-5" />} tone="slate" isLoading={isLoadingOverview} />
        <MetricCard title="پایبندی دارویی" value={`${overview?.adherenceRate ?? 0}%`} icon={<ClipboardCheck className="h-5 w-5" />} tone="emerald" isLoading={isLoadingOverview} />
        <MetricCard title="مصرف با تأخیر" value={overview?.lateCount ?? 0} icon={<Clock3 className="h-5 w-5" />} tone="amber" isLoading={isLoadingOverview} />
        <MetricCard title="مصرف‌نشده" value={overview?.missedCount ?? 0} icon={<AlertTriangle className="h-5 w-5" />} tone="rose" isLoading={isLoadingOverview} />
      </div>

      {activeTab === "dashboard" ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="mb-5 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-black text-gray-900">روند مصرف در بازه</h2>
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
              <h2 className="mb-4 text-lg font-black text-gray-900">بیماران پرخطر</h2>
              <div className="space-y-3">
                {overview?.patients?.length ? overview.patients.map((item) => (
                  <Link
                    key={item.careRecipientId}
                    href={`/dashboard/patients/${item.careRecipientId}?tab=medications`}
                    className="block rounded-2xl border border-gray-100 p-4 transition hover:border-rose-200 hover:bg-rose-50/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-black text-gray-900">{item.patientName}</div>
                        <div className="mt-1 text-sm text-gray-500">کل نوبت: {item.totalDoses} - Missed: {item.missedCount} - Late: {item.lateCount}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
                        {item.adherenceRate}%
                      </div>
                    </div>
                  </Link>
                )) : <div className="text-sm text-gray-500">داده‌ای یافت نشد.</div>}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="mb-4 text-lg font-black text-gray-900">عملکرد پرستاران/سالمندیاران</h2>
              {isLoadingStaff ? (
                <div className="py-8 text-center text-sm text-gray-500">در حال دریافت...</div>
              ) : staffPerformance?.length ? (
                <div className="space-y-2">
                  {staffPerformance.slice(0, 10).map((item) => (
                    <div key={item.userId} className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-teal-600" />
                        <div className="font-black text-slate-900">{item.userName || item.userId}</div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-600">
                        <span className="rounded-full bg-slate-100 px-3 py-1">ثبت: {item.recordedCount}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">تأیید: {item.verifiedCount}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">اصلاح: {item.correctedCount}</span>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">Late: {item.lateCount}</span>
                        <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">Missed: {item.missedCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-gray-500">داده‌ای موجود نیست.</div>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "rows" ? (
        <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-900">ردیف‌های عملیاتی</h2>
              <p className="mt-1 text-sm text-gray-500">فهرست ردیف‌ها برای بررسی، اصلاح، تأیید/رد و مشاهده تاریخچه تغییرات.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusChip active={statusFilter === "issues"} onClick={() => setStatusFilter("issues")}>نیازمند پیگیری</StatusChip>
              <StatusChip active={statusFilter === "pending"} onClick={() => setStatusFilter("pending")}>در انتظار تأیید</StatusChip>
              <StatusChip active={statusFilter === "late"} onClick={() => setStatusFilter("late")}>با تأخیر</StatusChip>
              <StatusChip active={statusFilter === "missed"} onClick={() => setStatusFilter("missed")}>مصرف‌نشده</StatusChip>
              <StatusChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>همه</StatusChip>
            </div>
          </div>

          <div className="grid gap-3 md:hidden">
            {visibleRows.length ? visibleRows.map((row) => {
              const presentation = getMedicationDoseStatusPresentation({
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

              return (
                <div key={row.doseId} className="rounded-3xl border border-slate-100 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-black text-slate-900">{row.patientName}</div>
                      <div className="mt-1 text-sm text-slate-700">{row.medicationName}</div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-full bg-slate-100 px-3 py-1">{new Date(row.scheduledTime).toLocaleString("fa-IR")}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">{getShiftSlotLabel(row.scheduledShiftSlot)}</span>
                        {typeof row.delayMinutes === "number" ? <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">تاخیر: {row.delayMinutes} دقیقه</span> : null}
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${presentation.className}`}>{presentation.label}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-slate-500">ثبت‌کننده: {row.recordedByName || row.verifiedByName || "-"}</div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openManage(row)}
                        className="rounded-2xl bg-teal-600 px-4 py-2 text-xs font-black text-white hover:bg-teal-700"
                      >
                        مدیریت
                      </button>
                      <Link
                        href={`/dashboard/patients/${row.careRecipientId}?tab=medications&doseId=${row.doseId}`}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
                      >
                        پرونده
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-500">
                ردیفی برای نمایش وجود ندارد.
              </div>
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr className="text-right text-gray-500">
                  <th className="px-4 py-3">بیمار</th>
                  <th className="px-4 py-3">دارو</th>
                  <th className="px-4 py-3">زمان</th>
                  <th className="px-4 py-3">شیفت</th>
                  <th className="px-4 py-3">وضعیت</th>
                  <th className="px-4 py-3">ثبت‌کننده</th>
                  <th className="px-4 py-3">اکشن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleRows.length ? visibleRows.map((row) => {
                  const presentation = getMedicationDoseStatusPresentation({
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

                  return (
                    <tr key={row.doseId}>
                      <td className="px-4 py-3 font-bold text-gray-900">{row.patientName}</td>
                      <td className="px-4 py-3 text-gray-700">{row.medicationName}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(row.scheduledTime).toLocaleString("fa-IR")}</td>
                      <td className="px-4 py-3 text-gray-500">{getShiftSlotLabel(row.scheduledShiftSlot)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${presentation.className}`}>{presentation.label}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{row.recordedByName || row.verifiedByName || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openManage(row)}
                            className="rounded-2xl bg-teal-600 px-4 py-2 text-xs font-black text-white hover:bg-teal-700"
                          >
                            مدیریت
                          </button>
                          <Link href={`/dashboard/patients/${row.careRecipientId}?tab=medications&doseId=${row.doseId}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">
                            پرونده
                          </Link>
                        </div>
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
      ) : null}

      {activeTab === "adherence" ? (
        <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h2 className="text-lg font-black text-gray-900">گزارش پایبندی (به تفکیک بیمار و دارو)</h2>
            <p className="mt-1 text-sm text-gray-500">محاسبه بر اساس نوبت‌های برنامه‌ریزی‌شده در بازه زمانی انتخاب‌شده.</p>
          </div>

          {isLoadingAdherence ? (
            <div className="py-10 text-center text-gray-500">در حال آماده‌سازی...</div>
          ) : adherenceBreakdown?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="text-right text-gray-500">
                    <th className="px-4 py-3">بیمار</th>
                    <th className="px-4 py-3">دارو</th>
                    <th className="px-4 py-3">کل نوبت</th>
                    <th className="px-4 py-3">مصرف</th>
                    <th className="px-4 py-3">OnTime</th>
                    <th className="px-4 py-3">Late</th>
                    <th className="px-4 py-3">Missed</th>
                    <th className="px-4 py-3">Adherence%</th>
                    <th className="px-4 py-3">OnTime%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {adherenceBreakdown.map((row) => (
                    <tr key={`${row.careRecipientId}-${row.medicationId}`}>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        <Link href={`/dashboard/patients/${row.careRecipientId}?tab=medications`} className="hover:text-teal-700 text-teal-600 font-black">
                          {row.patientName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{row.medicationName}</td>
                      <td className="px-4 py-3 text-slate-600">{row.totalDoses}</td>
                      <td className="px-4 py-3 text-slate-600">{row.takenCount}</td>
                      <td className="px-4 py-3 text-slate-600">{row.onTimeCount}</td>
                      <td className="px-4 py-3 text-amber-700 font-bold">{row.lateCount}</td>
                      <td className="px-4 py-3 text-rose-700 font-bold">{row.missedCount}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{row.adherenceRate}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{row.onTimeRate}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500">داده‌ای برای نمایش وجود ندارد.</div>
          )}
        </section>
      ) : null}

      {activeTab === "settings" ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-black text-gray-900">تنظیمات پایش و هشدارهای دارو</h2>
            </div>
            <p className="mt-2 text-sm text-gray-500">مدیریت بازه مجاز ثبت مصرف قبل/بعد از زمان دارو و همچنین پیام‌ها و کانال‌های هشدار.</p>
            <div className="mt-4">
              <Link href="/dashboard/admin/settings/medication-alerts" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-black text-white hover:bg-teal-700">
                ورود به تنظیمات پایش دارو
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-black text-gray-900">بازه مجاز ثبت با تأخیر</h2>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              تنظیمات سراسری بازه مجاز ثبت قبل و بعد از زمان دارو از طریق پنل ادمین قابل مدیریت است. در صورت نیاز، همچنان می‌توانید تنظیمات اختصاصی هر دارو را در پرونده بیمار نگه دارید.
            </p>
            <div className="mt-4 text-sm text-slate-600">
              برای ویرایش، از کارت سمت راست وارد «تنظیمات پایش دارو» شوید.
            </div>
          </div>
        </section>
      ) : null}

      <MedicationDoseManagementDialog
        open={isManageOpen}
        onOpenChange={(value) => {
          setIsManageOpen(value);
          if (!value) {
            setSelectedRow(null);
          }
        }}
        row={selectedRow}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black transition ${active ? "bg-teal-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
    >
      {icon}
      {children}
    </button>
  );
}

function StatusChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-black transition ${active ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
    >
      {children}
    </button>
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

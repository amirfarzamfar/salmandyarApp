"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  endOfMonth,
  endOfWeek,
  formatDistanceToNow,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { faIR } from "date-fns/locale";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BadgeAlert,
  BellRing,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock3,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LineChart as LineChartIcon,
  MessageSquareWarning,
  Pill,
  PlusCircle,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  UserCog,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { PageHeader } from "@/components/navigation/PageHeader";
import { cn } from "@/lib/utils";
import { formatTehranDateValue } from "@/lib/tehran-date";
import { homeCareService } from "@/services/home-care.service";
import { medicationService } from "@/services/medication.service";
import { patientService } from "@/services/patient.service";
import { userService, type PaginatedResult, type UserListDto } from "@/services/user.service";
import { HomeCareRequestStatus, type HomeCareRequestListItem } from "@/types/home-care";
import {
  MedicationAdministrationOutcome,
  MedicationStockStatus,
  MedicationTimingStatus,
  MedicationVerificationStatus,
  type MedicationAdministrationOverviewReport,
  type MedicationAdministrationStaffPerformance,
  type MedicationAdministrationTrendPoint,
  type MedicationDose,
} from "@/types/medication";
import { CareLevel, type PatientList } from "@/types/patient";
import { ServiceCategory } from "@/types/service";

type FilterPreset = "today" | "week" | "month" | "custom";
type ActivityTone = "teal" | "amber" | "rose" | "violet" | "sky";

interface AdminDashboardBaseData {
  patients: PatientList[];
  users: PaginatedResult<UserListDto>;
  requests: HomeCareRequestListItem[];
  shiftBoard: MedicationDose[];
}

interface AdminDashboardMedicationData {
  overview: MedicationAdministrationOverviewReport;
  trend: MedicationAdministrationTrendPoint[];
  staffPerformance: MedicationAdministrationStaffPerformance[];
}

interface DashboardActivityItem {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  href: string;
  tone: ActivityTone;
  icon: LucideIcon;
}

interface AlertListItem {
  id: string;
  title: string;
  description: string;
  href: string;
  priority: "critical" | "high" | "medium";
}

interface ChartDatum {
  name: string;
  value: number;
  color: string;
}

interface MonthlyTrendDatum {
  label: string;
  admissions: number;
  visits: number;
  medication: number;
}

interface QuickActionItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: "teal" | "slate" | "violet" | "amber" | "rose";
}

const PIE_COLORS = ["#14b8a6", "#2563eb", "#8b5cf6", "#f59e0b", "#ef4444", "#0f172a"];
const WEEK_STARTS_ON = 6 as const;
const RANGE_OPTIONS: Array<{ id: FilterPreset; label: string }> = [
  { id: "today", label: "امروز" },
  { id: "week", label: "هفته جاری" },
  { id: "month", label: "ماه جاری" },
  { id: "custom", label: "بازه دلخواه" },
];

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    title: "ثبت بیمار جدید",
    description: "ساخت کاربر و شروع فرآیند پذیرش بیمار",
    href: "/dashboard/admin/users",
    icon: UserPlus,
    tone: "teal",
  },
  {
    title: "ایجاد برنامه ویزیت",
    description: "مدیریت سرویس‌ها و برنامه‌ریزی اقدامات روزانه",
    href: "/dashboard/services",
    icon: CalendarClock,
    tone: "slate",
  },
  {
    title: "ثبت گزارش پرستاری",
    description: "انتخاب بیمار و ثبت گزارش‌های مراقبتی",
    href: "/dashboard/patients",
    icon: FileText,
    tone: "violet",
  },
  {
    title: "مدیریت داروها",
    description: "پایش مصرف، اصلاح سریع و کنترل موجودی",
    href: "/dashboard/admin/medication-administration",
    icon: Pill,
    tone: "amber",
  },
  {
    title: "هشدارهای بحرانی",
    description: "بررسی موارد حساس و نیازمند مداخله فوری",
    href: "/dashboard/admin/medication-administration",
    icon: ShieldAlert,
    tone: "rose",
  },
  {
    title: "مدیریت کاربران",
    description: "کنترل نقش‌ها، قفل حساب و مجوزها",
    href: "/dashboard/admin/users",
    icon: UserCog,
    tone: "slate",
  },
  {
    title: "بیماران نیازمند پیگیری",
    description: "مرور بیماران پرریسک و پیگیری‌های باز",
    href: "/dashboard/patients",
    icon: HeartPulse,
    tone: "teal",
  },
  {
    title: "ارسال اعلان",
    description: "مدیریت پیام‌ها و تنظیمات اعلان‌های سیستمی",
    href: "/dashboard/admin/settings/notifications",
    icon: BellRing,
    tone: "violet",
  },
];

export default function DashboardPage() {
  const initialRange = useMemo(() => getRangeByPreset("week"), []);
  const [preset, setPreset] = useState<FilterPreset>("week");
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);

  const rangeEnd = useMemo(() => safeParseDate(`${to}T12:00:00`) ?? new Date(), [to]);
  const recentTrendRange = useMemo(() => {
    const recentTo = formatTehranDateValue(rangeEnd);
    const recentFrom = formatTehranDateValue(startOfMonth(subMonths(rangeEnd, 5)));
    return { from: recentFrom, to: recentTo };
  }, [rangeEnd]);

  const {
    data: baseData,
    isLoading: isLoadingBase,
    isFetching: isFetchingBase,
    error: baseError,
    refetch: refetchBase,
  } = useQuery<AdminDashboardBaseData>({
    queryKey: ["admin-dashboard", "base"],
    queryFn: async () => {
      const [patients, users, requests, shiftBoard] = await Promise.all([
        patientService.getAll(),
        userService.getUsers({
          pageNumber: 1,
          pageSize: 1000,
        }),
        homeCareService.getAllRequests(),
        medicationService.getShiftBoard(new Date(), { pendingOnly: false }),
      ]);

      return { patients, users, requests, shiftBoard };
    },
    staleTime: 60_000,
  });

  const {
    data: medicationData,
    isLoading: isLoadingMedication,
    isFetching: isFetchingMedication,
    error: medicationError,
    refetch: refetchMedication,
  } = useQuery<AdminDashboardMedicationData>({
    queryKey: ["admin-dashboard", "medication", from, to],
    queryFn: async () => {
      const filters = { from, to };
      const [overview, trend, staffPerformance] = await Promise.all([
        medicationService.getAdministrationOverviewReport(filters),
        medicationService.getAdministrationTrendReport(filters),
        medicationService.getAdministrationStaffPerformanceReport(filters),
      ]);

      return { overview, trend, staffPerformance };
    },
    staleTime: 60_000,
  });

  const {
    data: recentMedicationTrend,
    isLoading: isLoadingRecentTrend,
    refetch: refetchRecentTrend,
  } = useQuery<MedicationAdministrationTrendPoint[]>({
    queryKey: ["admin-dashboard", "recent-medication-trend", recentTrendRange.from, recentTrendRange.to],
    queryFn: () => medicationService.getAdministrationTrendReport(recentTrendRange),
    staleTime: 60_000,
  });

  const dashboardNow = useMemo(() => new Date(), []);
  const patients = useMemo(() => baseData?.patients ?? [], [baseData?.patients]);
  const users = useMemo(() => baseData?.users.items ?? [], [baseData?.users.items]);
  const requests = useMemo(() => baseData?.requests ?? [], [baseData?.requests]);
  const shiftBoard = useMemo(() => baseData?.shiftBoard ?? [], [baseData?.shiftBoard]);
  const medicationOverview = medicationData?.overview;
  const medicationTrend = useMemo(() => medicationData?.trend ?? [], [medicationData?.trend]);
  const staffPerformance = useMemo(() => medicationData?.staffPerformance ?? [], [medicationData?.staffPerformance]);

  const isBusy = isLoadingBase || isLoadingMedication || isLoadingRecentTrend || isFetchingBase || isFetchingMedication;

  const activePatientsCount = useMemo(
    () => patients.filter((patient) => isActivePatientStatus(patient.currentStatus)).length,
    [patients],
  );

  const criticalPatients = useMemo(
    () => patients.filter((patient) => isCriticalPatientStatus(patient.currentStatus)),
    [patients],
  );

  const nurseCount = useMemo(
    () => users.filter((user) => matchesAnyRole(user.roles, ["nurse", "assistantnurse", "پرستار", "کمک پرستار"])).length,
    [users],
  );

  const caregiverCount = useMemo(
    () => users.filter((user) => matchesAnyRole(user.roles, ["caregiver", "assistant", "مراقب", "سالمندیار"])).length,
    [users],
  );

  const newPatientsCount = useMemo(
    () => requests.filter((request) => isWithinRange(request.createdAt, from, to)).length,
    [requests, from, to],
  );

  const todaysVisitsCount = useMemo(
    () =>
      requests.filter((request) => {
        const visitDate = getVisitDate(request);
        return Boolean(visitDate) && isSameTehranDay(visitDate as string, new Date()) && !isClosedRequest(request.status);
      }).length,
    [requests],
  );

  const overdueVisits = useMemo(
    () =>
      requests.filter((request) => {
        const visitDate = getVisitDate(request);
        if (!visitDate || isClosedRequest(request.status)) {
          return false;
        }

        const parsed = safeParseDate(visitDate);
        return Boolean(parsed) && parsed.getTime() < dashboardNow.getTime();
      }),
    [dashboardNow, requests],
  );

  const lowStockMedications = useMemo(() => {
    const map = new Map<number, MedicationDose>();

    shiftBoard
      .filter(
        (dose) =>
          dose.stockStatus === MedicationStockStatus.LowStock ||
          dose.stockStatus === MedicationStockStatus.OutOfStock ||
          dose.isLowStockAlertActive,
      )
      .forEach((dose) => {
        if (!map.has(dose.medicationId)) {
          map.set(dose.medicationId, dose);
        }
      });

    return Array.from(map.values());
  }, [shiftBoard]);

  const importantAlertsCount = criticalPatients.length + lowStockMedications.length + overdueVisits.length;
  const needsActionCount =
    (medicationOverview?.pendingCount ?? 0) +
    criticalPatients.length +
    overdueVisits.length +
    (medicationOverview?.missedCount ?? 0);

  const patientStatusData = useMemo<ChartDatum[]>(() => {
    const buckets = new Map<string, number>();

    patients.forEach((patient) => {
      const label = normalizePatientStatus(patient.currentStatus);
      buckets.set(label, (buckets.get(label) ?? 0) + 1);
    });

    return Array.from(buckets.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [patients]);

  const careLevelData = useMemo<ChartDatum[]>(() => {
    const values = new Map<string, number>();

    patients.forEach((patient) => {
      const label = getCareLevelLabel(patient.careLevel);
      values.set(label, (values.get(label) ?? 0) + 1);
    });

    return Array.from(values.entries()).map(([name, value], index) => ({
      name,
      value,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }));
  }, [patients]);

  const serviceCategoryData = useMemo<ChartDatum[]>(() => {
    const values = new Map<string, number>();

    requests.forEach((request) => {
      const label = getServiceCategoryLabel(request.serviceCategory);
      values.set(label, (values.get(label) ?? 0) + 1);
    });

    return Array.from(values.entries()).map(([name, value], index) => ({
      name,
      value,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }));
  }, [requests]);

  const requestStatusBars = useMemo(
    () =>
      Object.values(HomeCareRequestStatus)
        .filter((value): value is HomeCareRequestStatus => typeof value === "number")
        .map((status) => ({
          name: getHomeCareStatusLabel(status),
          count: requests.filter((request) => request.status === status).length,
        }))
        .filter((item) => item.count > 0),
    [requests],
  );

  const medicationOutcomeBars = useMemo(
    () => [
      { name: "مصرف‌شده", value: medicationOverview?.takenCount ?? 0, color: "#10b981" },
      { name: "با تاخیر", value: medicationOverview?.lateCount ?? 0, color: "#f59e0b" },
      { name: "مصرف‌نشده", value: medicationOverview?.missedCount ?? 0, color: "#ef4444" },
      { name: "در انتظار تایید", value: medicationOverview?.pendingCount ?? 0, color: "#0f172a" },
    ],
    [medicationOverview],
  );

  const staffPerformanceBars = useMemo(
    () =>
      [...staffPerformance]
        .sort((a, b) => b.totalTouchedCount - a.totalTouchedCount)
        .slice(0, 6)
        .map((item) => ({
          name: item.userName || "بدون نام",
          ثبت: item.recordedCount,
          تایید: item.verifiedCount,
          اصلاح: item.correctedCount,
        })),
    [staffPerformance],
  );

  const monthlyTrendData = useMemo<MonthlyTrendDatum[]>(() => {
    const months = Array.from({ length: 6 }, (_, index) => startOfMonth(subMonths(rangeEnd, 5 - index)));
    const seed = new Map<string, MonthlyTrendDatum>();

    months.forEach((monthDate) => {
      seed.set(toMonthKey(monthDate), {
        label: formatMonthLabel(monthDate),
        admissions: 0,
        visits: 0,
        medication: 0,
      });
    });

    requests.forEach((request) => {
      const createdAt = safeParseDate(request.createdAt);
      if (createdAt) {
        const key = toMonthKey(createdAt);
        const bucket = seed.get(key);
        if (bucket) {
          bucket.admissions += 1;
        }
      }

      const visitDate = getVisitDate(request);
      const parsedVisitDate = visitDate ? safeParseDate(visitDate) : null;
      if (parsedVisitDate) {
        const key = toMonthKey(parsedVisitDate);
        const bucket = seed.get(key);
        if (bucket) {
          bucket.visits += 1;
        }
      }
    });

    (recentMedicationTrend ?? []).forEach((point) => {
      const pointDate = safeParseDate(point.date);
      if (!pointDate) {
        return;
      }

      const bucket = seed.get(toMonthKey(pointDate));
      if (bucket) {
        bucket.medication += point.takenCount;
      }
    });

    return Array.from(seed.values());
  }, [rangeEnd, recentMedicationTrend, requests]);

  const topPatientsNeedingAttention = useMemo(() => {
    const items = medicationOverview?.patients ?? [];
    return [...items]
      .sort((a, b) => (b.missedCount + b.lateCount) - (a.missedCount + a.lateCount))
      .slice(0, 5);
  }, [medicationOverview?.patients]);

  const activityFeed = useMemo<DashboardActivityItem[]>(() => {
    const items: DashboardActivityItem[] = [];

    users.slice(0, 8).forEach((user) => {
      items.push({
        id: `user-${user.id}`,
        title: `کاربر جدید: ${user.firstName} ${user.lastName}`.trim(),
        description: `نقش‌های فعال: ${user.roles.join("، ") || user.role || "ثبت نشده"}`,
        occurredAt: user.createdAt,
        href: "/dashboard/admin/users",
        tone: "violet",
        icon: UserPlus,
      });
    });

    requests.slice(0, 8).forEach((request) => {
      items.push({
        id: `request-${request.id}`,
        title: `درخواست جدید ${request.serviceTitle}`,
        description: `کد پیگیری ${request.trackingCode} در وضعیت ${getHomeCareStatusLabel(request.status)}`,
        occurredAt: request.createdAt,
        href: "/dashboard/admin/home-care-requests",
        tone: "teal",
        icon: ClipboardList,
      });
    });

    shiftBoard
      .filter(
        (dose) =>
          dose.timingStatus === MedicationTimingStatus.Late ||
          dose.administrationOutcome === MedicationAdministrationOutcome.Missed ||
          dose.verificationStatus === MedicationVerificationStatus.Pending ||
          dose.isLowStockAlertActive,
      )
      .slice(0, 10)
      .forEach((dose) => {
        items.push({
          id: `dose-${dose.id}`,
          title: `${dose.patientName} - ${dose.medicationName}`,
          description: dose.isLowStockAlertActive
            ? "هشدار موجودی دارو فعال شده است"
            : dose.administrationOutcome === MedicationAdministrationOutcome.Missed
              ? "نوبت دارو مصرف نشده و نیازمند پیگیری است"
              : dose.timingStatus === MedicationTimingStatus.Late
                ? "ثبت دارو با تاخیر انجام شده است"
                : "ثبت دارو در انتظار تایید پرستار/مدیر است",
          occurredAt: dose.actualAdministrationAt ?? dose.scheduledTime,
          href: "/dashboard/admin/medication-administration",
          tone: dose.isLowStockAlertActive || dose.administrationOutcome === MedicationAdministrationOutcome.Missed ? "rose" : "amber",
          icon: dose.isLowStockAlertActive ? ShieldAlert : Pill,
        });
      });

    return items
      .filter((item) => safeParseDate(item.occurredAt))
      .sort((a, b) => {
        const first = safeParseDate(a.occurredAt)?.getTime() ?? 0;
        const second = safeParseDate(b.occurredAt)?.getTime() ?? 0;
        return second - first;
      })
      .slice(0, 10);
  }, [requests, shiftBoard, users]);

  const alertGroups = useMemo<AlertListItem[]>(() => {
    const items: AlertListItem[] = [];

    criticalPatients.slice(0, 3).forEach((patient) => {
      items.push({
        id: `critical-patient-${patient.id}`,
        title: patient.firstName ? `${patient.firstName} ${patient.lastName}` : `بیمار #${patient.id}`,
        description: `وضعیت بیمار: ${normalizePatientStatus(patient.currentStatus)}`,
        href: `/dashboard/patients/${patient.id}`,
        priority: "critical",
      });
    });

    lowStockMedications.slice(0, 3).forEach((dose) => {
      items.push({
        id: `low-stock-${dose.medicationId}`,
        title: `${dose.medicationName} برای ${dose.patientName}`,
        description: `موجودی فعلی ${formatNumber(dose.currentQuantity)} و آستانه هشدار ${formatNumber(dose.alertLimit)}`,
        href: `/dashboard/patients/${dose.careRecipientId}?tab=medications`,
        priority: dose.stockStatus === MedicationStockStatus.OutOfStock ? "critical" : "high",
      });
    });

    overdueVisits.slice(0, 3).forEach((request) => {
      items.push({
        id: `overdue-visit-${request.id}`,
        title: `${request.serviceTitle} - ${request.contactName}`,
        description: `ویزیت/تماس از ${formatShortDateTime(getVisitDate(request) ?? request.createdAt)} عقب افتاده است`,
        href: "/dashboard/admin/home-care-requests",
        priority: "high",
      });
    });

    const pendingMedicationReviews = medicationOverview?.rows
      ?.filter((row) => row.verificationStatus === MedicationVerificationStatus.Pending)
      .slice(0, 3) ?? [];

    pendingMedicationReviews.forEach((row) => {
      items.push({
        id: `pending-dose-${row.doseId}`,
        title: `${row.patientName} - ${row.medicationName}`,
        description: "ثبت دارو در انتظار بررسی و تایید نهایی است",
        href: "/dashboard/admin/medication-administration",
        priority: "medium",
      });
    });

    return items.slice(0, 10);
  }, [criticalPatients, lowStockMedications, medicationOverview?.rows, overdueVisits]);

  const totalTrendVolume = Math.max(
    1,
    ...medicationTrend.map((point) => point.takenCount + point.lateCount + point.missedCount + point.skippedCount),
  );

  const systemPulseTone = importantAlertsCount >= 8 ? "critical" : importantAlertsCount >= 4 ? "warning" : "healthy";

  const handlePresetChange = (nextPreset: FilterPreset) => {
    setPreset(nextPreset);

    if (nextPreset !== "custom") {
      const range = getRangeByPreset(nextPreset);
      setFrom(range.from);
      setTo(range.to);
    }
  };

  const handleDateChange = (value: DateObject | DateObject[] | null, setter: (value: string) => void) => {
    const selected = Array.isArray(value) ? value[0] : value;
    if (selected instanceof DateObject) {
      setter(formatTehranDateValue(selected.toDate()));
      setPreset("custom");
    }
  };

  const refreshDashboard = async () => {
    await Promise.all([refetchBase(), refetchMedication(), refetchRecentTrend()]);
  };

  return (
    <div className="space-y-6 pb-6">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.18),_transparent_30%),linear-gradient(135deg,_#0f172a_0%,_#111827_42%,_#0f766e_100%)] p-4 shadow-sm sm:p-6">
        <div className="absolute inset-y-0 left-0 w-56 bg-[radial-gradient(circle,_rgba(255,255,255,0.12),_transparent_65%)]" />
        <div className="relative">
          <PageHeader
            title="داشبورد مدیریتی"
            description="نمای یکپارچه برای پایش وضعیت بیماران، عملیات بالینی، داروها، هشدارهای بحرانی و بهره‌وری تیم در یک نگاه."
            theme="inverse"
            badge={
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-teal-100 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                نسخه اجرایی مدیر ارشد
              </span>
            }
            actions={
              <>
                <button
                  type="button"
                  onClick={() => void refreshDashboard()}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  <RefreshCcw className={cn("h-4 w-4", isBusy && "animate-spin")} />
                  بروزرسانی
                </button>
                <Link
                  href="/dashboard/patients"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-slate-900 transition hover:bg-slate-100"
                >
                  <PlusCircle className="h-4 w-4" />
                  مدیریت بیماران
                </Link>
              </>
            }
            className="mb-0"
          />

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur sm:p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <HeroPulseCard
                  icon={LayoutDashboard}
                  title="نبض سیستم"
                  value={getSystemPulseLabel(systemPulseTone)}
                  description={getSystemPulseDescription(systemPulseTone)}
                  tone={systemPulseTone}
                />
                <HeroPulseCard
                  icon={HeartPulse}
                  title="پایبندی دارویی"
                  value={`${formatNumber(medicationOverview?.adherenceRate ?? 0)}%`}
                  description="میانگین ثبت صحیح دارو در بازه انتخاب‌شده"
                  tone="healthy"
                />
                <HeroPulseCard
                  icon={ShieldAlert}
                  title="موارد نیازمند اقدام"
                  value={formatNumber(needsActionCount)}
                  description="جمع هشدارهای باز، تاخیرها و موارد در انتظار تایید"
                  tone={needsActionCount > 0 ? "warning" : "healthy"}
                />
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <MiniMetric
                  label="کل کاربران آنلاین/فعال"
                  value={`${formatNumber(users.filter((user) => user.isOnline).length)} / ${formatNumber(users.filter((user) => user.isActive).length)}`}
                />
                <MiniMetric
                  label="داروهای کم‌موجودی امروز"
                  value={formatNumber(lowStockMedications.length)}
                />
                <MiniMetric
                  label="ویزیت یا تماس‌های امروز"
                  value={formatNumber(todaysVisitsCount)}
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-950/20 p-4 backdrop-blur sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-bold text-white">فیلتر بازه زمانی</div>
                  <div className="mt-1 text-xs text-slate-300">تمامی نمودارهای عملیاتی و KPIهای پویا بر اساس این بازه محاسبه می‌شوند.</div>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                  {formatShortDate(from)} تا {formatShortDate(to)}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handlePresetChange(option.id)}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-black transition",
                      preset === option.id
                        ? "bg-white text-slate-900"
                        : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-200">از تاریخ</label>
                  <DatePicker
                    value={from ? new DateObject({ date: `${from}T12:00:00` }) : ""}
                    onChange={(value) => handleDateChange(value, setFrom)}
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    inputClass="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-slate-400"
                    containerStyle={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-200">تا تاریخ</label>
                  <DatePicker
                    value={to ? new DateObject({ date: `${to}T12:00:00` }) : ""}
                    onChange={(value) => handleDateChange(value, setTo)}
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    inputClass="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-slate-400"
                    containerStyle={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {(baseError || medicationError) ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          بخشی از داده‌های داشبورد بارگذاری نشد. لطفاً یک‌بار صفحه را بروزرسانی کنید یا اتصال API را بررسی کنید.
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        <StatCard
          title="کل بیماران"
          value={patients.length}
          subtitle="تعداد کل پرونده‌های ثبت‌شده"
          icon={Users}
          tone="slate"
          isLoading={isLoadingBase}
        />
        <StatCard
          title="بیماران فعال"
          value={activePatientsCount}
          subtitle="بیماران دارای وضعیت مراقبتی فعال"
          icon={HeartPulse}
          tone="teal"
          isLoading={isLoadingBase}
        />
        <StatCard
          title="بیماران جدید"
          value={newPatientsCount}
          subtitle="بر اساس درخواست‌های تازه در بازه"
          icon={UserPlus}
          tone="sky"
          isLoading={isLoadingBase}
        />
        <StatCard
          title="پرستاران و مراقبین"
          value={nurseCount + caregiverCount}
          subtitle={`پرستار ${formatNumber(nurseCount)} / مراقب ${formatNumber(caregiverCount)}`}
          icon={Stethoscope}
          tone="violet"
          isLoading={isLoadingBase}
        />
        <StatCard
          title="ویزیت‌های امروز"
          value={todaysVisitsCount}
          subtitle="تماس یا ویزیت‌های برنامه‌ریزی‌شده امروز"
          icon={CalendarClock}
          tone="amber"
          isLoading={isLoadingBase}
        />
        <StatCard
          title="داروهای رو به اتمام"
          value={lowStockMedications.length}
          subtitle="موارد کم‌موجودی یا اتمام موجودی"
          icon={Pill}
          tone="amber"
          isLoading={isLoadingBase}
        />
        <StatCard
          title="هشدارهای مهم"
          value={importantAlertsCount}
          subtitle="بحرانی، کم‌موجودی و ویزیت‌های عقب‌افتاده"
          icon={BadgeAlert}
          tone="rose"
          isLoading={isLoadingBase || isLoadingMedication}
        />
        <StatCard
          title="نیازمند اقدام"
          value={needsActionCount}
          subtitle="موارد در انتظار تایید یا پیگیری فوری"
          icon={AlertTriangle}
          tone="rose"
          isLoading={isLoadingMedication}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.95fr)]">
        <SectionCard
          title="روند مدیریتی ماه‌های اخیر"
          description="نمای روند ورودی پرونده‌ها، ویزیت/تماس‌های برنامه‌ریزی‌شده و ثبت‌های دارویی در شش ماه اخیر."
          icon={LineChartIcon}
        >
          {isLoadingRecentTrend ? (
            <ChartSkeleton />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#64748b" tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                  <Line type="monotone" dataKey="admissions" name="ورودی بیمار" stroke="#0f766e" strokeWidth={3} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="visits" name="ویزیت/تماس" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="medication" name="مصرف دارو" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
          <SectionCard
            title="ترکیب وضعیت بیماران"
            description="پراکندگی وضعیت فعلی بیماران برای تشخیص سریع تراکم ریسک."
            icon={HeartPulse}
          >
            <PiePanel data={patientStatusData} emptyText="برای نمایش توزیع وضعیت، داده‌ی بیمار در دسترس نیست." />
          </SectionCard>

          <SectionCard
            title="سطح مراقبتی و دسته‌بندی خدمات"
            description="ترکیب سطح مراقبت و درخواست‌های فعال برای سنجش فشار عملیاتی."
            icon={Activity}
            contentClassName="grid gap-5 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"
          >
            <PiePanel data={careLevelData} emptyText="سطح مراقبتی ثبت نشده است." compact />
            <PiePanel data={serviceCategoryData} emptyText="دسته‌بندی خدماتی برای نمایش موجود نیست." compact />
          </SectionCard>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <div className="grid gap-6">
          <SectionCard
            title="نمودار عملیاتی بازه انتخاب‌شده"
            description="مقایسه حجم نوبت‌های دارویی، تاخیرها و موارد مصرف‌نشده در بازه انتخابی."
            icon={Pill}
          >
            {isLoadingMedication ? (
              <ChartSkeleton />
            ) : (
              <div className="space-y-5">
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={medicationOutcomeBars}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                        {medicationOutcomeBars.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {medicationTrend.length ? (
                  <div className="space-y-3">
                    {medicationTrend.slice(-4).map((point) => {
                      const total = point.takenCount + point.lateCount + point.missedCount + point.skippedCount;
                      const width = `${(total / totalTrendVolume) * 100}%`;

                      return (
                        <div key={point.date} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-bold text-slate-900">{formatShortDate(point.date)}</span>
                            <span className="text-slate-500">{formatNumber(total)} نوبت</span>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500"
                              style={{ width }}
                            />
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span>مصرف: {formatNumber(point.takenCount)}</span>
                            <span>تاخیر: {formatNumber(point.lateCount)}</span>
                            <span>مصرف‌نشده: {formatNumber(point.missedCount)}</span>
                            <span>عدم مصرف: {formatNumber(point.skippedCount)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState text="برای این بازه، روندی از عملیات دارویی ثبت نشده است." />
                )}
              </div>
            )}
          </SectionCard>

          <div className="grid gap-6 2xl:grid-cols-2">
            <SectionCard
              title="عملکرد پرستاران"
              description="بالاترین حجم عملیات ثبت، تایید و اصلاح در تیم اجرایی."
              icon={Users}
            >
              {isLoadingMedication ? (
                <ChartSkeleton />
              ) : staffPerformanceBars.length ? (
                <div className="h-[290px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={staffPerformanceBars}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend />
                      <Bar dataKey="ثبت" stackId="staff" fill="#14b8a6" radius={[10, 10, 0, 0]} />
                      <Bar dataKey="تایید" stackId="staff" fill="#2563eb" />
                      <Bar dataKey="اصلاح" stackId="staff" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState text="برای این بازه، داده‌ای از عملکرد کارکنان وجود ندارد." />
              )}
            </SectionCard>

            <SectionCard
              title="وضعیت درخواست‌ها"
              description="نمای عملیاتی از توزیع وضعیت درخواست‌ها و ویزیت‌ها."
              icon={ClipboardList}
            >
              {isLoadingBase ? (
                <ChartSkeleton />
              ) : requestStatusBars.length ? (
                <div className="h-[290px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={requestStatusBars}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="count" fill="#0f172a" radius={[12, 12, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState text="درخواست فعالی برای نمایش موجود نیست." />
              )}
            </SectionCard>
          </div>
        </div>

        <div className="grid gap-6">
          <SectionCard
            title="اقدامات سریع"
            description="میانبرهای پرتکرار برای تسریع مدیریت روزانه."
            icon={Sparkles}
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {QUICK_ACTIONS.map((action) => (
                <QuickActionCard key={action.title} action={action} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="هشدارهای مهم"
            description="موارد اولویت‌دار بر اساس ریسک بیمار، دارو و عملیات باز."
            icon={ShieldAlert}
          >
            {alertGroups.length ? (
              <div className="space-y-3">
                {alertGroups.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-slate-300 hover:bg-white"
                  >
                    <div className={cn("mt-0.5 rounded-xl p-2", getPriorityTone(item.priority))}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-black text-slate-900">{item.title}</div>
                        <PriorityBadge priority={item.priority} />
                      </div>
                      <div className="mt-1 text-sm leading-6 text-slate-600">{item.description}</div>
                    </div>
                    <ChevronLeft className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState text="در حال حاضر هشدار اولویت‌دار بازی وجود ندارد." />
            )}
          </SectionCard>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.92fr)]">
        <SectionCard
          title="Activity Feed"
          description="آخرین رویدادهای کلیدی سیستم از ثبت درخواست و فعالیت کاربران تا هشدارهای دارویی."
          icon={Clock3}
        >
          {activityFeed.length ? (
            <div className="space-y-3">
              {activityFeed.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className={cn("rounded-2xl p-2.5", getActivityTone(item.tone))}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div className="font-black text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-400">
                          {formatDistanceToNow(safeParseDate(item.occurredAt) ?? new Date(), { addSuffix: true, locale: faIR })}
                        </div>
                      </div>
                      <div className="mt-1 text-sm leading-6 text-slate-600">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState text="فعالیتی برای نمایش ثبت نشده است." />
          )}
        </SectionCard>

        <div className="grid gap-6">
          <SectionCard
            title="بیماران و عملیات نیازمند پیگیری"
            description="افراد و عملیات با بیشترین فشار کاری یا ریسک بالاتر در بازه انتخاب‌شده."
            icon={MessageSquareWarning}
          >
            {topPatientsNeedingAttention.length ? (
              <div className="space-y-3">
                {topPatientsNeedingAttention.map((item) => (
                  <Link
                    key={item.careRecipientId}
                    href={`/dashboard/patients/${item.careRecipientId}?tab=medications`}
                    className="block rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-teal-200 hover:bg-teal-50/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-black text-slate-900">{item.patientName}</div>
                        <div className="mt-1 text-sm text-slate-600">
                          کل نوبت {formatNumber(item.totalDoses)} | تاخیر {formatNumber(item.lateCount)} | مصرف‌نشده {formatNumber(item.missedCount)}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-black text-white">
                        {formatNumber(item.adherenceRate)}%
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState text="بیمار اولویت‌داری برای این بازه یافت نشد." />
            )}
          </SectionCard>

          <SectionCard
            title="جمع‌بندی اجرایی"
            description="سه نمای سریع برای تصمیم‌گیری مدیر بدون ورود به صفحات جزئیات."
            icon={CheckCircle2}
          >
            <div className="grid gap-3">
              <SummaryTile
                title="نرخ تایید ثبت دارو"
                value={`${formatNumber(medicationOverview?.onTimeRate ?? 0)}%`}
                description="سهم ثبت‌های به‌موقع از کل نوبت‌های بازه انتخاب‌شده"
                tone="teal"
              />
              <SummaryTile
                title="درخواست‌های باز عملیاتی"
                value={formatNumber(requests.filter((request) => !isClosedRequest(request.status)).length)}
                description="همه درخواست‌هایی که هنوز به مرحله نهایی نرسیده‌اند"
                tone="amber"
              />
              <SummaryTile
                title="کاربران آنلاین"
                value={formatNumber(users.filter((user) => user.isOnline).length)}
                description="تعداد کاربران حاضر در لحظه برای عملیات زنده"
                tone="violet"
              />
            </div>
          </SectionCard>
        </div>
      </section>
    </div>
  );
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  className,
  contentClassName,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section className={cn("rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6", className)}>
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      <div className={cn("min-w-0", contentClassName)}>{children}</div>
    </section>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
  isLoading,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  tone: "slate" | "teal" | "sky" | "violet" | "amber" | "rose";
  isLoading?: boolean;
}) {
  const toneClass = {
    slate: "from-slate-50 to-white text-slate-900 ring-slate-200",
    teal: "from-teal-50 to-white text-teal-900 ring-teal-100",
    sky: "from-sky-50 to-white text-sky-900 ring-sky-100",
    violet: "from-violet-50 to-white text-violet-900 ring-violet-100",
    amber: "from-amber-50 to-white text-amber-900 ring-amber-100",
    rose: "from-rose-50 to-white text-rose-900 ring-rose-100",
  }[tone];

  return (
    <div className={cn("rounded-[26px] bg-gradient-to-br p-5 shadow-sm ring-1", toneClass)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold">{title}</div>
          <div className="mt-4 text-3xl font-black tracking-tight">{isLoading ? "..." : formatNumber(value)}</div>
        </div>
        <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-6 text-slate-500">{subtitle}</p>
    </div>
  );
}

function HeroPulseCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: "healthy" | "warning" | "critical";
}) {
  const toneClass = {
    healthy: "border-emerald-400/20 bg-emerald-400/10 text-emerald-50",
    warning: "border-amber-400/20 bg-amber-400/10 text-amber-50",
    critical: "border-rose-400/20 bg-rose-400/10 text-rose-50",
  }[tone];

  return (
    <div className={cn("rounded-[24px] border p-4", toneClass)}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-bold">{title}</div>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-2xl font-black">{value}</div>
      <div className="mt-2 text-xs leading-6 text-white/75">{description}</div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-xs font-medium text-slate-300">{label}</div>
      <div className="mt-2 text-lg font-black text-white">{value}</div>
    </div>
  );
}

function PiePanel({
  data,
  emptyText,
  compact = false,
}: {
  data: ChartDatum[];
  emptyText: string;
  compact?: boolean;
}) {
  if (!data.length) {
    return <EmptyState text={emptyText} />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
      <div className={cn("h-[220px]", compact && "h-[200px]")}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={compact ? 40 : 55} outerRadius={compact ? 74 : 88} paddingAngle={3}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-bold text-slate-800">{item.name}</span>
            </div>
            <span className="text-sm font-black text-slate-900">{formatNumber(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActionCard({ action }: { action: QuickActionItem }) {
  const Icon = action.icon;
  const toneClass = {
    teal: "bg-teal-50 text-teal-700 border-teal-100",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
  }[action.tone];

  return (
    <Link
      href={action.href}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-slate-300 hover:bg-white"
    >
      <div className={cn("rounded-2xl border p-3", toneClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-black text-slate-900">{action.title}</div>
        <div className="mt-1 text-sm leading-6 text-slate-500">{action.description}</div>
      </div>
      <ArrowLeft className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:-translate-x-1" />
    </Link>
  );
}

function PriorityBadge({ priority }: { priority: "critical" | "high" | "medium" }) {
  const toneClass = {
    critical: "bg-rose-50 text-rose-700 border-rose-200",
    high: "bg-amber-50 text-amber-700 border-amber-200",
    medium: "bg-slate-100 text-slate-700 border-slate-200",
  }[priority];

  const label = {
    critical: "بحرانی",
    high: "بالا",
    medium: "متوسط",
  }[priority];

  return <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-black", toneClass)}>{label}</span>;
}

function SummaryTile({
  title,
  value,
  description,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  tone: "teal" | "amber" | "violet";
}) {
  const toneClass = {
    teal: "border-teal-100 bg-teal-50/50 text-teal-900",
    amber: "border-amber-100 bg-amber-50/50 text-amber-900",
    violet: "border-violet-100 bg-violet-50/50 text-violet-900",
  }[tone];

  return (
    <div className={cn("rounded-2xl border p-4", toneClass)}>
      <div className="text-sm font-bold">{title}</div>
      <div className="mt-3 text-2xl font-black">{value}</div>
      <div className="mt-2 text-xs leading-6 text-slate-600">{description}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-[260px] animate-pulse rounded-2xl bg-slate-100" />;
}

function getRangeByPreset(preset: Exclude<FilterPreset, "custom">) {
  const now = new Date();

  if (preset === "today") {
    const value = formatTehranDateValue(now);
    return { from: value, to: value };
  }

  if (preset === "month") {
    return {
      from: formatTehranDateValue(startOfMonth(now)),
      to: formatTehranDateValue(endOfMonth(now)),
    };
  }

  return {
    from: formatTehranDateValue(startOfWeek(now, { weekStartsOn: WEEK_STARTS_ON })),
    to: formatTehranDateValue(endOfWeek(now, { weekStartsOn: WEEK_STARTS_ON })),
  };
}

function safeParseDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isWithinRange(value: string, from: string, to: string) {
  const target = safeParseDate(value);
  const rangeStart = safeParseDate(`${from}T00:00:00`);
  const rangeEnd = safeParseDate(`${to}T23:59:59`);

  if (!target || !rangeStart || !rangeEnd) {
    return false;
  }

  return target.getTime() >= rangeStart.getTime() && target.getTime() <= rangeEnd.getTime();
}

function isSameTehranDay(value: string, reference: Date) {
  return formatTehranDateValue(new Date(value)) === formatTehranDateValue(reference);
}

function formatNumber(value: number | string) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("fa-IR").format(value);
  }

  return value;
}

function formatShortDate(value: string) {
  const parsed = safeParseDate(value);
  if (!parsed) {
    return "-";
  }

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "short",
  }).format(parsed);
}

function formatShortDateTime(value: string) {
  const parsed = safeParseDate(value);
  if (!parsed) {
    return "-";
  }

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    month: "short",
  }).format(date);
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

function normalizePatientStatus(status?: string) {
  if (!status?.trim()) {
    return "نامشخص";
  }

  const lower = status.toLowerCase();

  if (lower.includes("critical") || status.includes("بحران")) return "بحرانی";
  if (lower.includes("unstable") || status.includes("ناپایدار")) return "ناپایدار";
  if (lower.includes("stable") || status.includes("پایدار")) return "پایدار";
  if (lower.includes("recover") || status.includes("بهبود")) return "در حال بهبود";
  if (lower.includes("active") || status.includes("فعال")) return "فعال";

  return status;
}

function isCriticalPatientStatus(status?: string) {
  if (!status) {
    return false;
  }

  const lower = status.toLowerCase();
  return ["critical", "unstable", "emergency", "acute"].some((keyword) => lower.includes(keyword)) ||
    ["بحرانی", "ناپایدار", "اورژانسی", "حاد"].some((keyword) => status.includes(keyword));
}

function isActivePatientStatus(status?: string) {
  if (!status) {
    return true;
  }

  const lower = status.toLowerCase();
  const blockedKeywords = ["inactive", "discharged", "completed", "archived", "cancelled"];
  const blockedFaKeywords = ["غیرفعال", "مرخص", "خاتمه", "آرشیو", "لغو"];

  return !blockedKeywords.some((keyword) => lower.includes(keyword)) &&
    !blockedFaKeywords.some((keyword) => status.includes(keyword));
}

function matchesAnyRole(roles: string[] | undefined, keywords: string[]) {
  const normalized = (roles ?? []).map((role) => role.toLowerCase());
  return normalized.some((role) => keywords.some((keyword) => role.includes(keyword.toLowerCase())));
}

function getCareLevelLabel(level: CareLevel) {
  const labels: Record<CareLevel, string> = {
    [CareLevel.Level1]: "سطح ۱",
    [CareLevel.Level2]: "سطح ۲",
    [CareLevel.Level3]: "سطح ۳",
    [CareLevel.Level4]: "سطح ۴",
    [CareLevel.Level5]: "سطح ۵",
  };

  return labels[level] ?? "ثبت نشده";
}

function getHomeCareStatusLabel(status: HomeCareRequestStatus) {
  const labels: Record<HomeCareRequestStatus, string> = {
    [HomeCareRequestStatus.Draft]: "پیش‌نویس",
    [HomeCareRequestStatus.Submitted]: "ثبت‌شده",
    [HomeCareRequestStatus.UnderSupervisorReview]: "بررسی سرپرست",
    [HomeCareRequestStatus.ContactScheduled]: "تماس زمان‌بندی‌شده",
    [HomeCareRequestStatus.AwaitingDocuments]: "در انتظار مدارک",
    [HomeCareRequestStatus.MatchingCaregiver]: "در حال تطبیق",
    [HomeCareRequestStatus.AwaitingPatientConfirmation]: "در انتظار تایید بیمار",
    [HomeCareRequestStatus.InService]: "در حال خدمت",
    [HomeCareRequestStatus.Completed]: "تکمیل‌شده",
    [HomeCareRequestStatus.SatisfactionPending]: "در انتظار رضایت‌سنجی",
    [HomeCareRequestStatus.Cancelled]: "لغوشده",
  };

  return labels[status] ?? "نامشخص";
}

function getServiceCategoryLabel(category: ServiceCategory) {
  const labels: Record<ServiceCategory, string> = {
    [ServiceCategory.Nursing]: "پرستاری",
    [ServiceCategory.Medical]: "پزشکی",
    [ServiceCategory.Rehabilitation]: "توانبخشی",
    [ServiceCategory.PersonalCare]: "مراقبت شخصی",
    [ServiceCategory.Emergency]: "اورژانسی",
    [ServiceCategory.Other]: "سایر",
  };

  return labels[category] ?? "سایر";
}

function isClosedRequest(status: HomeCareRequestStatus) {
  return [HomeCareRequestStatus.Completed, HomeCareRequestStatus.Cancelled].includes(status);
}

function getVisitDate(request: HomeCareRequestListItem) {
  return request.estimatedContactAt ?? request.createdAt;
}

function getSystemPulseLabel(tone: "healthy" | "warning" | "critical") {
  return {
    healthy: "پایدار",
    warning: "نیازمند توجه",
    critical: "بحرانی",
  }[tone];
}

function getSystemPulseDescription(tone: "healthy" | "warning" | "critical") {
  return {
    healthy: "شاخص‌های عملیاتی در وضعیت قابل قبول قرار دارند.",
    warning: "تعدادی مورد نیازمند پیگیری و بازبینی فوری هستند.",
    critical: "تجمع هشدارها بالا است و مداخله سریع توصیه می‌شود.",
  }[tone];
}

function getPriorityTone(priority: "critical" | "high" | "medium") {
  return {
    critical: "bg-rose-50 text-rose-700",
    high: "bg-amber-50 text-amber-700",
    medium: "bg-slate-100 text-slate-700",
  }[priority];
}

function getActivityTone(tone: ActivityTone) {
  return {
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    violet: "bg-violet-50 text-violet-700",
    sky: "bg-sky-50 text-sky-700",
  }[tone];
}

const TOOLTIP_STYLE = {
  borderRadius: "16px",
  borderColor: "#e2e8f0",
  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
};

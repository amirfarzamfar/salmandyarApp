import {
  LayoutList,
  CalendarDays,
  Clock3,
  PlayCircle,
  CheckCircle2,
  XCircle,
  UserPlus,
  Bell,
  ListChecks
} from "lucide-react";
import type { PatientServiceStatisticsDto } from "@/types/patient-service";
import { cn } from "@/lib/utils";

export type StatsFilterKey =
  | "all"
  | "today"
  | "pending"
  | "inProgress"
  | "completed"
  | "cancelled"
  | "unassigned"
  | "withNotification";

interface StatsCardsProps {
  statistics?: PatientServiceStatisticsDto;
  isLoading: boolean;
  activeFilter: StatsFilterKey;
  onFilterChange: (filter: StatsFilterKey) => void;
}

interface StatCardConfig {
  key: StatsFilterKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgLight: string;
  value: (s: PatientServiceStatisticsDto) => number;
}

const cards: StatCardConfig[] = [
  {
    key: "all",
    label: "کل خدمات",
    icon: ListChecks,
    color: "text-slate-700 dark:text-slate-200",
    bgLight: "bg-slate-100 dark:bg-slate-800",
    value: (s) => s.totalServices,
  },
  {
    key: "today",
    label: "خدمات امروز",
    icon: CalendarDays,
    color: "text-sky-700 dark:text-sky-400",
    bgLight: "bg-sky-100 dark:bg-sky-900/40",
    value: (s) => s.todayServices,
  },
  {
    key: "pending",
    label: "در انتظار",
    icon: Clock3,
    color: "text-amber-700 dark:text-amber-400",
    bgLight: "bg-amber-100 dark:bg-amber-900/40",
    value: (s) => s.pendingServices,
  },
  {
    key: "inProgress",
    label: "در حال انجام",
    icon: PlayCircle,
    color: "text-teal-700 dark:text-teal-400",
    bgLight: "bg-teal-100 dark:bg-teal-900/40",
    value: (s) => s.inProgressServices,
  },
  {
    key: "completed",
    label: "تکمیل‌شده",
    icon: CheckCircle2,
    color: "text-emerald-700 dark:text-emerald-400",
    bgLight: "bg-emerald-100 dark:bg-emerald-900/40",
    value: (s) => s.completedServices,
  },
  {
    key: "cancelled",
    label: "لغوشده",
    icon: XCircle,
    color: "text-rose-700 dark:text-rose-400",
    bgLight: "bg-rose-100 dark:bg-rose-900/40",
    value: (s) => s.cancelledServices,
  },
  {
    key: "unassigned",
    label: "بدون تخصیص",
    icon: UserPlus,
    color: "text-orange-700 dark:text-orange-400",
    bgLight: "bg-orange-100 dark:bg-orange-900/40",
    value: (s) => s.unassignedServices,
  },
  {
    key: "withNotification",
    label: "دارای اعلان",
    icon: Bell,
    color: "text-indigo-700 dark:text-indigo-400",
    bgLight: "bg-indigo-100 dark:bg-indigo-900/40",
    value: (s) => s.servicesWithNotification,
  },
];

function formatNumber(n: number) {
  return n.toLocaleString("fa-IR");
}

export function StatsCards({
  statistics,
  isLoading,
  activeFilter,
  onFilterChange,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.key;
        const value = statistics ? card.value(statistics) : 0;

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onFilterChange(card.key)}
            className={cn(
              "group relative overflow-hidden rounded-xl border p-4 text-right transition-all",
              "hover:shadow-md active:scale-[0.98]",
              isActive
                ? "border-teal-500 bg-teal-50 shadow-lg shadow-teal-500/10 dark:border-teal-500/60 dark:bg-teal-950/40"
                : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  card.bgLight,
                  card.color
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              {isActive && (
                <LayoutList className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              )}
            </div>

            <div className="mt-3">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {card.label}
              </div>
              {isLoading ? (
                <div className="mt-1 h-7 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              ) : (
                <div
                  className={cn(
                    "mt-1 text-2xl font-black tracking-tight",
                    isActive
                      ? "text-teal-700 dark:text-teal-300"
                      : "text-slate-900 dark:text-slate-100"
                  )}
                >
                  {formatNumber(value)}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

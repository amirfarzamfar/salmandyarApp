"use client";

import { Activity, FileText, HeartPulse, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function NurseBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isDashboard = pathname === "/nurse-portal";
  const isReports = pathname === "/nurse-portal/reports" || pathname.startsWith("/nurse-portal/reports/");
  const isVitalQuick = pathname.startsWith("/nurse-portal/patient-management") && searchParams.get("openVitals") === "1";
  const isMyPatients =
    (pathname.startsWith("/nurse-portal/patient-management") && !isVitalQuick) ||
    pathname.startsWith("/nurse-portal/patient/") ||
    pathname.startsWith("/nurse-portal/vital-signs");

  return (
    <nav className="fixed inset-x-0 md:hidden z-40 px-4 bottom-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-md rounded-[2.25rem] bg-white/80 backdrop-blur-2xl border border-white/45 shadow-soft-lg px-3 py-2">
        <div className="grid grid-cols-4 gap-1">
          <NavItem icon={LayoutDashboard} label="داشبورد" href="/nurse-portal" active={isDashboard} />
          <NavItem icon={Activity} label="بیماران من" href="/nurse-portal/patient-management" active={isMyPatients} />
          <NavItem icon={FileText} label="ثبت گزارش" href="/nurse-portal/reports?new=1" active={isReports} />
          <NavItem icon={HeartPulse} label="ثبت علائم" href="/nurse-portal/patient-management?openVitals=1" active={isVitalQuick} />
        </div>
      </div>
    </nav>
  );
}

function NavItem({ icon: Icon, label, href, active = false }: { icon: any, label: string, href: string, active?: boolean }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1.5 rounded-[1.5rem] px-1 py-2 transition-all group active:scale-95"
      aria-current={active ? "page" : undefined}
    >
      <div
        className={[
          "h-10 w-10 rounded-[1.25rem] flex items-center justify-center transition-all",
          active
            ? "bg-gradient-to-br from-medical-500 to-medical-600 text-white shadow-glow-medical shadow-soft-sm scale-[1.02]"
            : "bg-transparent text-gray-400 group-hover:text-medical-600",
        ].join(" ")}
      >
        <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
      </div>
      <span
        className={[
          "text-[10px] font-black tracking-tight transition-colors",
          active ? "text-medical-700 dark:text-medical-300" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300",
        ].join(" ")}
      >
        {label}
      </span>
    </Link>
  );
}

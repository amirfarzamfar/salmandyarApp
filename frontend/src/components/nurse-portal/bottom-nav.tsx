"use client";

import { LayoutDashboard, FileText, Calendar, BriefcaseBusiness, ClipboardCheck, GraduationCap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NurseBottomNav() {
  const pathname = usePathname();
  const isDashboard = pathname === "/nurse-portal" || pathname.startsWith("/nurse-portal/patient") || pathname.startsWith("/nurse-portal/patient-management") || pathname.startsWith("/nurse-portal/profile");
  const isAssessments = pathname === "/nurse-portal/assessments" || pathname.startsWith("/nurse-portal/assessments/");
  const isExams = pathname === "/nurse-portal/exams" || pathname.startsWith("/nurse-portal/exams/");
  const isReports = pathname === "/nurse-portal/reports" || pathname.startsWith("/nurse-portal/reports/");
  const isServices = pathname === "/nurse-portal/services" || pathname.startsWith("/nurse-portal/services/");
  const isEmployment = pathname === "/nurse-portal/employment-profile" || pathname.startsWith("/nurse-portal/employment-profile/");

  return (
    <nav className="fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-2xl border border-white/40 py-4 px-4 md:hidden z-40 shadow-soft-lg rounded-3xl">
      <div className="flex justify-between items-center max-w-md mx-auto overflow-x-auto scrollbar-hide gap-2">
        <NavItem icon={LayoutDashboard} label="داشبورد" href="/nurse-portal" active={isDashboard} />
        <NavItem icon={ClipboardCheck} label="ارزیابی‌ها" href="/nurse-portal/assessments" active={isAssessments} />
        <NavItem icon={GraduationCap} label="آزمون‌ها" href="/nurse-portal/exams" active={isExams} />
        <NavItem icon={FileText} label="گزارش‌ها" href="/nurse-portal/reports" active={isReports} />
        <NavItem icon={Calendar} label="خدمات" href="/nurse-portal/services" active={isServices} />
        <NavItem icon={BriefcaseBusiness} label="استخدامی" href="/nurse-portal/employment-profile" active={isEmployment} />
      </div>
    </nav>
  );
}

function NavItem({ icon: Icon, label, href, active = false }: { icon: any, label: string, href: string, active?: boolean }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1.5 transition-all group active:scale-90">
      <div className={`p-2 rounded-2xl transition-all ${active ? 'bg-medical-500 text-white shadow-glow-medical' : 'text-gray-400 group-hover:text-medical-500'}`}>
        <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className={`text-[10px] font-bold transition-all ${active ? 'text-medical-600' : 'text-gray-400'}`}>
        {label}
      </span>
    </Link>
  );
}

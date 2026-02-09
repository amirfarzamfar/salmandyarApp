"use client";

import { Users, FileText, Calendar, UserCircle, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NurseBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-2xl border border-white/40 py-4 px-6 md:hidden z-50 shadow-soft-lg rounded-3xl">
      <div className="flex justify-between items-center max-w-sm mx-auto">
        <NavItem icon={Users} label="بیماران" href="/nurse-portal" active={pathname === '/nurse-portal'} />
        <NavItem icon={ClipboardCheck} label="ارزیابی‌ها" href="/nurse-portal/assessments" active={pathname === '/nurse-portal/assessments'} />
        <NavItem icon={FileText} label="گزارش‌ها" href="/nurse-portal/reports" active={pathname === '/nurse-portal/reports'} />
        <NavItem icon={Calendar} label="خدمات" href="/nurse-portal/services" active={pathname === '/nurse-portal/services'} />
        <NavItem icon={UserCircle} label="پروفایل" href="/nurse-portal/profile" active={pathname === '/nurse-portal/profile'} />
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

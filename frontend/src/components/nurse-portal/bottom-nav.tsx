"use client";

import { LayoutDashboard, Activity } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NurseBottomNav() {
  const pathname = usePathname();
  const isMyPatients =
    pathname.startsWith("/nurse-portal/patient-management") ||
    pathname.startsWith("/nurse-portal/patient/") ||
    pathname.startsWith("/nurse-portal/vital-signs");
  const isDashboard = (pathname === "/nurse-portal" || pathname.startsWith("/nurse-portal/")) && !isMyPatients;

  return (
    <nav className="fixed left-4 right-4 md:hidden z-40 shadow-soft-lg rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/40 px-6 py-4 bottom-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between max-w-md mx-auto gap-6">
        <NavItem icon={LayoutDashboard} label="داشبورد" href="/nurse-portal" active={isDashboard} />
        <NavItem icon={Activity} label="بیماران من" href="/nurse-portal/patient-management" active={isMyPatients} />
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

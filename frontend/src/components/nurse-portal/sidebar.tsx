"use client";

import { Users, FileText, Calendar, UserCircle, ClipboardCheck, LogOut, LayoutDashboard, Activity, GraduationCap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/components/auth/UserContext";
import { cn } from "@/lib/utils";

export function NurseSidebar() {
  const pathname = usePathname();
  const { logout } = useUser();

  const menuItems = [
    { icon: LayoutDashboard, label: "داشبورد", href: "/nurse-portal" },
    { icon: Activity, label: "علائم حیاتی", href: "/nurse-portal/vital-signs" },
    { icon: Users, label: "بیماران", href: "/nurse-portal/patients" },
    { icon: ClipboardCheck, label: "ارزیابی‌ها", href: "/nurse-portal/assessments" },
    { icon: GraduationCap, label: "آزمون‌ها", href: "/nurse-portal/exams" },
    { icon: FileText, label: "گزارش‌ها", href: "/nurse-portal/reports" },
    { icon: Calendar, label: "خدمات", href: "/nurse-portal/services" },
    { icon: UserCircle, label: "پروفایل", href: "/nurse-portal/profile" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 right-0 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 z-50 transition-colors duration-300">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-500 to-medical-600 flex items-center justify-center text-white shadow-glow-medical">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">سالمندیار</h1>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500">پنل پرستار</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/nurse-portal' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
                isActive 
                  ? "bg-medical-50 dark:bg-medical-900/20 text-medical-600 dark:text-medical-400 font-bold" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 font-medium"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-white dark:bg-medical-900/40 shadow-sm text-medical-500" 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span>{item.label}</span>
              
              {isActive && (
                <div className="mr-auto w-1.5 h-1.5 rounded-full bg-medical-500 shadow-glow-medical" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all duration-200 group font-medium"
        >
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-400 group-hover:text-rose-500 transition-colors">
            <LogOut size={20} strokeWidth={2} />
          </div>
          <span>خروج از حساب</span>
        </button>
      </div>
    </aside>
  );
}

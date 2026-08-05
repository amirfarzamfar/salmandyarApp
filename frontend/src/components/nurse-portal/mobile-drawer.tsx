"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, GraduationCap, FileText, Calendar, BriefcaseBusiness, UserCircle, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/auth/UserContext";

export function NurseMobileDrawer() {
  const pathname = usePathname();
  const { logout } = useUser();
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () => [
      { icon: ClipboardCheck, label: "ارزیابی‌ها", href: "/nurse-portal/assessments" },
      { icon: GraduationCap, label: "آزمون‌ها", href: "/nurse-portal/exams" },
      { icon: FileText, label: "گزارش‌ها", href: "/nurse-portal/reports" },
      { icon: Calendar, label: "خدمات", href: "/nurse-portal/services" },
      { icon: BriefcaseBusiness, label: "پروفایل استخدامی", href: "/nurse-portal/employment-profile" },
      { icon: UserCircle, label: "پروفایل", href: "/nurse-portal/profile" },
    ],
    []
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  const topOffsetClass = "top-[calc(1rem+env(safe-area-inset-top))]";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed right-4 z-50 md:hidden",
          topOffsetClass,
          "h-12 w-12 rounded-2xl bg-gradient-to-br from-medical-500 to-medical-600 text-white shadow-glow-medical shadow-soft-md",
          "flex items-center justify-center active:scale-95 transition-transform"
        )}
        aria-label="باز کردن منو"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 md:hidden w-[88vw] max-w-80 bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl border-l border-white/40 dark:border-gray-800/60 shadow-soft-lg",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="منوی پنل پرستار"
        aria-hidden={!open}
      >
        <div className={cn("px-4", topOffsetClass, "pt-0")}>
          <div className="h-[calc(1rem+env(safe-area-inset-top))]" />
          <div className="flex items-center justify-between pb-4 pt-2 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-500 to-medical-600 flex items-center justify-center text-white shadow-glow-medical">
                <span className="text-base font-black leading-none">س</span>
              </div>
              <div>
                <div className="text-lg font-black text-gray-900 dark:text-white tracking-tight">سالمندیار</div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500">منو</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-10 w-10 rounded-2xl flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/60 transition-colors"
              aria-label="بستن منو"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="px-4 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          {items.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/nurse-portal" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
                  isActive
                    ? "bg-medical-50 dark:bg-medical-900/20 text-medical-600 dark:text-medical-400 font-bold"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white font-medium"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-white dark:bg-medical-900/40 shadow-sm text-medical-500"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200"
                  )}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-medical-500 shadow-glow-medical" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-gray-100 dark:border-gray-800 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all duration-200 group font-medium"
          >
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 transition-colors">
              <LogOut size={20} strokeWidth={2} />
            </div>
            <span>خروج از حساب</span>
          </button>
        </div>
      </aside>
    </>
  );
}


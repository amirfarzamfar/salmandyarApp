'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, UserCog, FileText, Settings, LogOut, ClipboardList, ChevronDown, ChevronLeft, Bell, Clock, List, Brain, UserCheck, BarChart2, X } from 'lucide-react';
import { authService } from '@/services/auth.service';

const navigation = [
  { name: 'داشبورد', href: '/dashboard', icon: LayoutDashboard },
  { name: 'مدیریت بیماران', href: '/dashboard/patients', icon: Users },
  { name: 'مدیریت خدمات', href: '/dashboard/services', icon: ClipboardList },
  { name: 'مدیریت کاربران', href: '/dashboard/admin/users', icon: Users },
  { name: 'مدیریت شیفت‌ها', href: '/dashboard/admin/shifts', icon: Clock },
  { name: 'پیکربندی گزارشات', href: '/dashboard/admin/report-config', icon: Settings },
  { 
    name: 'مدیریت آزمون‌ها', 
    href: '#', 
    icon: ClipboardList,
    subItems: [
        { name: 'لیست آزمون‌ها', href: '/dashboard/admin/assessments', icon: List },
        { name: 'مدیریت آزمون کاربران', href: '/dashboard/admin/assessments/user-assignments', icon: UserCheck },
        { name: 'ایجاد آزمون', href: '/dashboard/admin/assessments/create', icon: FileText },
        { name: 'تطبیق هوشمند', href: '/dashboard/admin/matching', icon: Brain },
        { name: 'گزارش آزمون‌ها', href: '/dashboard/admin/assessments/reports', icon: BarChart2 }
    ]
  },
  {
      name: 'مدیریت ارزیابی کاربران',
      href: '/dashboard/admin/user-evaluations',
      icon: UserCheck,
      subItems: [
          { name: 'لیست فرم‌های ارزیابی', href: '/dashboard/admin/user-evaluations', icon: List },
          { name: 'مدیریت ارزیابی کاربران', href: '/dashboard/admin/user-evaluations/user-assignments', icon: UserCheck },
          { name: 'ایجاد فرم ارزیابی', href: '/dashboard/admin/user-evaluations/create', icon: FileText }
      ]
  },
  { name: 'مدیریت پرسنل', href: '/dashboard/personnel', icon: UserCog },
  { name: 'گزارش‌ها', href: '/dashboard/reports', icon: FileText },
  { 
    name: 'تنظیمات', 
    href: '#', 
    icon: Settings,
    subItems: [
        { name: 'تنظیمات پیام', href: '/dashboard/admin/settings/notifications', icon: Bell }
    ]
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  const toggleSubMenu = (name: string) => {
    setOpenSubMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };
  const handleLogout = () => {
    authService.logout();
    onClose();
    router.push('/login');
  };

  const handleNavigate = () => {
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-[88vw] max-w-64 flex-col bg-slate-900 text-white shadow-2xl transition-transform duration-300 lg:w-64 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0`}
      >
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        <span className="text-xl font-bold text-teal-400">سالمندیار</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="بستن منو"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isSubItemActive = hasSubItems && item.subItems?.some(sub => pathname === sub.href);
            const isActive = !hasSubItems && (pathname === item.href || pathname.startsWith(`${item.href}/`));
            const isOpen = openSubMenus[item.name] || isSubItemActive;

            return (
              <div key={item.name}>
                  {hasSubItems ? (
                      <button
                        onClick={() => toggleSubMenu(item.name)}
                        className={`w-full group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                          isSubItemActive || isOpen
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center">
                            <item.icon
                            className={`ml-3 flex-shrink-0 h-6 w-6 ${
                                isSubItemActive || isOpen ? 'text-teal-400' : 'text-slate-400 group-hover:text-white'
                            }`}
                            />
                            {item.name}
                        </div>
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                      </button>
                  ) : (
                    <Link
                        href={item.href}
                        onClick={handleNavigate}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                            ? 'bg-slate-800 text-teal-400'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <item.icon
                        className={`ml-3 flex-shrink-0 h-6 w-6 ${
                            isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-white'
                        }`}
                        />
                        {item.name}
                    </Link>
                  )}

                  {/* Sub Menu */}
                  {hasSubItems && isOpen && (
                      <div className="mt-1 space-y-1 pr-11">
                          {item.subItems?.map(sub => {
                              const isSubActive = pathname === sub.href;
                              return (
                                <Link
                                    key={sub.name}
                                    href={sub.href}
                                    onClick={handleNavigate}
                                    className={`group flex items-center px-2 py-2 text-xs font-medium rounded-md transition-colors ${
                                    isSubActive
                                        ? 'text-teal-400 bg-slate-800/50'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                    }`}
                                >
                                    {sub.name}
                                </Link>
                              );
                          })}
                      </div>
                  )}
              </div>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-400 rounded-md hover:bg-slate-800 hover:text-red-300 transition-colors"
        >
          <LogOut className="ml-3 h-6 w-6" />
          خروج از حساب
        </button>
      </div>
      </aside>
    </>
  );
}

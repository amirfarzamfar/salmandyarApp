'use client';

import { Menu, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AuthResponse } from '@/types/auth';
import { translateRole } from '@/utils/role-translation';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { PublicSiteLink } from '@/components/navigation/PublicSiteLink';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [user, setUser] = useState<AuthResponse | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }, []);

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'کاربر';
  const initial = user?.firstName ? user.firstName.charAt(0) : 'U';
  const roleName = translateRole(user?.role);

  return (
    <header className="sticky top-0 z-30 flex min-h-16 flex-wrap items-center justify-between gap-3 bg-white px-4 py-3 shadow-sm sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"
          aria-label="باز کردن منو"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden w-full max-w-md sm:block">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pr-10 border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 sm:text-sm py-2 border"
            placeholder="جستجو در پنل..."
          />
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 sm:hidden"
          aria-label="جستجو"
        >
          <Search className="h-5 w-5" />
        </button>
        <PublicSiteLink className="rounded-lg border-slate-200 bg-white px-2.5 sm:px-3" />
        <NotificationCenter />
        <div className="flex items-center">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800">
            {initial}
          </div>
          <div className="mr-3 hidden min-w-0 flex-col sm:flex">
            <span className="text-sm font-medium text-gray-700">{fullName}</span>
            {roleName && <span className="text-xs text-gray-500">{roleName}</span>}
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import { Bell, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AuthResponse } from '@/types/auth';
import { translateRole } from '@/utils/role-translation';

export default function Header() {
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
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
      <div className="flex items-center flex-1">
        <div className="relative w-full max-w-md">
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
      <div className="flex items-center space-x-4 space-x-reverse">
        <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
          <span className="sr-only">مشاهده اعلان‌ها</span>
          <Bell className="h-6 w-6" />
        </button>
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-bold">
            {initial}
          </div>
          <div className="mr-3 flex flex-col">
            <span className="text-sm font-medium text-gray-700">{fullName}</span>
            {roleName && <span className="text-xs text-gray-500">{roleName}</span>}
          </div>
        </div>
      </div>
    </header>
  );
}

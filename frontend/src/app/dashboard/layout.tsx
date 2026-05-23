'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { DashboardAlert } from '@/components/dashboard/DashboardAlert';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 font-[family-name:var(--font-vazirmatn)]" dir="rtl">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:pr-64">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <DashboardAlert />
          {children}
        </main>
      </div>
    </div>
  );
}

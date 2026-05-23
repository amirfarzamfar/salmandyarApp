'use client';

import UserAssignmentManagement from '@/components/admin/assessments/UserAssignmentManagement';

export default function UserAssignmentsPage() {
  return (
    <div className="space-y-6 bg-slate-900 min-h-screen rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">مدیریت آزمون کاربران</h1>
      </div>
      
      <UserAssignmentManagement />
    </div>
  );
}

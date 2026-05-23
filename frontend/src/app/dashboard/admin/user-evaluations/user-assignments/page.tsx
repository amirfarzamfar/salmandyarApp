'use client';

import UserEvaluationManagement from '@/components/admin/user-evaluations/UserEvaluationManagement';

export default function UserEvaluationsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 rounded-2xl bg-slate-900 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">مدیریت ارزیابی کاربران</h1>
      </div>
      
      <UserEvaluationManagement />
    </div>
  );
}

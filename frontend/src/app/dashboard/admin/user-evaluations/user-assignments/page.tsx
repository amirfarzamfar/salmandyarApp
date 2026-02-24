'use client';

import UserEvaluationManagement from '@/components/admin/user-evaluations/UserEvaluationManagement';

export default function UserEvaluationsPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black dark:text-white">مدیریت ارزیابی کاربران</h1>
      </div>
      
      <UserEvaluationManagement />
    </div>
  );
}

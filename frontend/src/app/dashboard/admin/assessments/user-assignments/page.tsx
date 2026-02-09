'use client';

import UserAssignmentManagement from '@/components/admin/assessments/UserAssignmentManagement';

export default function UserAssignmentsPage() {
  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">مدیریت آزمون کاربران</h1>
      </div>
      
      <UserAssignmentManagement />
    </div>
  );
}

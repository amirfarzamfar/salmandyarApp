'use client';

import MyAssessmentsList from '@/components/dashboard/MyAssessmentsList';

export default function MyAssessmentsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">آزمون‌های من</h1>
      </div>
      
      <MyAssessmentsList />
    </div>
  );
}

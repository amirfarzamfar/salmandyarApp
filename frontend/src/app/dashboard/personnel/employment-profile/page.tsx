'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import CaregiverProfileWizard from '@/components/caregiver-profile/CaregiverProfileWizard';

function PersonnelEmploymentProfileContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  if (!userId) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
        شناسه پرسنل برای مشاهده پروفایل استخدامی ارسال نشده است.
      </div>
    );
  }

  return <CaregiverProfileWizard adminUserId={userId} />;
}

export default function PersonnelEmploymentProfilePage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        }
      >
        <PersonnelEmploymentProfileContent />
      </Suspense>
    </div>
  );
}

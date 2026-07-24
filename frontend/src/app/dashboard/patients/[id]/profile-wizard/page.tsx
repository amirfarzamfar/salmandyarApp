"use client";

import { useParams } from 'next/navigation';
import { ProfileWizardPageContent } from '@/components/profile-wizard/ProfileWizardPageContent';

export default function DashboardPatientProfileWizardPage() {
  const params = useParams<{ id: string }>();
  const patientId = params.id;
  const patientDetailHref = `/dashboard/patients/${patientId}?tab=profile`;

  return (
    <ProfileWizardPageContent
      adminBackHref={patientDetailHref}
      adminBackLabel="بازگشت به پروفایل درمانی بیمار"
      adminCompleteRedirectHref={patientDetailHref}
      adminCompleteConfirmButtonText="بازگشت به پرونده بیمار"
      adminBreadcrumbs={[
        { label: 'داشبورد', href: '/dashboard' },
        { label: 'مدیریت بیماران', href: '/dashboard/patients' },
        { label: 'جزئیات بیمار', href: patientDetailHref },
        { label: 'ویرایش پروفایل درمانی' },
      ]}
    />
  );
}

import { ProfileWizardPageContent } from '@/components/profile-wizard/ProfileWizardPageContent';

export default function ProfileWizardPage() {
  return (
    <ProfileWizardPageContent
      portalBreadcrumbs={[
        { label: 'پورتال سلامت', href: '/portal' },
        { label: 'پروفایل', href: '/portal/profile' },
        { label: 'تکمیل پروفایل درمانی' },
      ]}
    />
  );
}

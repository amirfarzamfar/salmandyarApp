import { Suspense } from 'react';
import { LabCatalogClient } from '@/features/labs/LabCatalogClient';

export const metadata = {
  title: 'مدیریت آزمایش‌ها | سالمندیار',
  description: 'مدیریت کاتالوگ دسته‌ها و فرمول‌های آزمایشگاهی',
};

export default function LabCatalogPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <LabCatalogClient />
      </Suspense>
    </div>
  );
}

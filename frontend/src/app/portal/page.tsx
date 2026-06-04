import { Suspense } from 'react';
import PortalPageClient from './PortalPageClient';

export default function PortalPage() {
  return (
    <Suspense fallback={null}>
      <PortalPageClient />
    </Suspense>
  );
}
